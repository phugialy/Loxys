import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { token, name, phone_e164, email, date_of_birth, consent_sms, consent_email } =
      await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Join token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!name || (!phone_e164 && !email)) {
      return new Response(
        JSON.stringify({ error: "Name and at least one contact method required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate join token (support both UUID token and custom slug)
    const isSlug = /^[a-z0-9-]+$/.test(token) && !token.includes('{');
    
    let tokenQuery = supabase
      .from("join_tokens")
      .select("account_id, active");
    
    if (isSlug) {
      tokenQuery = tokenQuery.eq("slug", token);
    } else {
      tokenQuery = tokenQuery.eq("token", token);
    }
    
    const { data: joinToken, error: tokenError } = await tokenQuery.single();

    if (tokenError || !joinToken || !joinToken.active) {
      return new Response(
        JSON.stringify({ error: "Invalid or inactive join token" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize inputs
    const normalizedPhone = phone_e164 ? phone_e164.trim() : null;
    const normalizedEmail = email ? email.toLowerCase().trim() : null;

    // Check if customer already exists with same name + phone or same name + email
    // New rules:
    // ✅ Same phone, different name = ALLOWED
    // ✅ Same email, different name = ALLOWED
    // ❌ Same name + same phone = NOT ALLOWED
    // ❌ Same name + same email = NOT ALLOWED
    
    const normalizedName = name.trim();
    
    if (normalizedPhone) {
      const { data: existingByNamePhone } = await supabase
        .from("customers")
        .select("id, name, phone_e164, email")
        .eq("account_id", joinToken.account_id)
        .eq("name", normalizedName)
        .eq("phone_e164", normalizedPhone)
        .maybeSingle();
      
      if (existingByNamePhone) {
        return new Response(
          JSON.stringify({ 
            error: "A customer with this name and phone number already exists",
            existing_customer: {
              name: existingByNamePhone.name,
              phone: existingByNamePhone.phone_e164,
              email: existingByNamePhone.email
            }
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    if (normalizedEmail) {
      const { data: existingByNameEmail } = await supabase
        .from("customers")
        .select("id, name, phone_e164, email")
        .eq("account_id", joinToken.account_id)
        .eq("name", normalizedName)
        .eq("email", normalizedEmail)
        .maybeSingle();
      
      if (existingByNameEmail) {
        return new Response(
          JSON.stringify({ 
            error: "A customer with this name and email already exists",
            existing_customer: {
              name: existingByNameEmail.name,
              phone: existingByNameEmail.phone_e164,
              email: existingByNameEmail.email
            }
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Insert new customer (no existing customer found)
    const { data: newCustomer, error: insertError } = await supabase
      .from("customers")
      .insert({
        account_id: joinToken.account_id,
        name: name.trim(),
        phone_e164: normalizedPhone,
        email: normalizedEmail,
        date_of_birth: date_of_birth || null,
        status: "active",
      })
      .select()
      .single();

    if (insertError || !newCustomer) {
      console.error("Customer insert error:", insertError);
      // Check if it's a unique constraint violation (race condition)
      if (insertError?.code === '23505') {
        return new Response(
          JSON.stringify({ error: "A customer with this contact information already exists" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Failed to create customer" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const customer = newCustomer;

    // Get client IP and user agent
    let clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null;
    // x-forwarded-for can be comma-separated, take the first one
    if (clientIP && clientIP.includes(",")) {
      clientIP = clientIP.split(",")[0].trim();
    }
    const userAgent = req.headers.get("user-agent") || null;

    // Record consents
    const consentRecords = [];
    if (consent_sms && normalizedPhone) {
      consentRecords.push({
        customer_id: customer.id,
        channel: "sms",
        status: "granted",
        captured_via: "web",
        ip_address: clientIP || null, // Convert empty string to null for inet type
        user_agent: userAgent,
      });
    }
    if (consent_email && normalizedEmail) {
      consentRecords.push({
        customer_id: customer.id,
        channel: "email",
        status: "granted",
        captured_via: "web",
        ip_address: clientIP || null,
        user_agent: userAgent,
      });
    }

    if (consentRecords.length > 0) {
      const { error: consentError, data: insertedConsents } = await supabase
        .from("consents")
        .insert(consentRecords)
        .select();

      if (consentError) {
        console.error("Consent insert error:", consentError);
        // Return error details for debugging
        return new Response(
          JSON.stringify({ 
            error: "Failed to record consent",
            details: consentError.message 
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log("Consents inserted:", insertedConsents?.length || 0);
    }

    return new Response(
      JSON.stringify({ success: true, customer_id: customer.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
