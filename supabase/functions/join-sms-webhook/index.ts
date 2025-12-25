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
    // Parse form data (Twilio sends form-encoded data)
    const formData = await req.formData();
    const from = formData.get("From")?.toString();
    const body = formData.get("Body")?.toString()?.trim().toUpperCase();
    const messageSid = formData.get("MessageSid")?.toString();

    if (!from || !body) {
      return new Response(
        "Missing required fields",
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Normalize phone to E.164 (assuming Twilio sends in E.164)
    const phoneE164 = from.startsWith("+") ? from : `+${from}`;

    if (body === "JOIN") {
      // Find active customers with this phone number
      const { data: customers } = await supabase
        .from("customers")
        .select("id, account_id")
        .eq("phone_e164", phoneE164)
        .eq("status", "active")
        .limit(1);

      if (customers && customers.length > 0) {
        const customer = customers[0];
        
        // Record SMS consent
        await supabase.from("consents").insert({
          customer_id: customer.id,
          channel: "sms",
          status: "granted",
          captured_via: "sms",
        });
      }

      return new Response(
        "You have been added to our list. Reply STOP to unsubscribe.",
        { status: 200, headers: corsHeaders }
      );
    }

    if (body === "STOP" || body === "STOPALL" || body === "UNSUBSCRIBE") {
      // Find customers with this phone number across all accounts
      const { data: customers } = await supabase
        .from("customers")
        .select("id, account_id")
        .eq("phone_e164", phoneE164)
        .eq("status", "active");

      if (customers && customers.length > 0) {
        // Add to unsubscribe list for each account
        // Check if unsubscribe already exists, then insert if not
        for (const customer of customers) {
          // Check if unsubscribe already exists
          const { data: existing } = await supabase
            .from("unsubscribes")
            .select("id")
            .eq("account_id", customer.account_id)
            .eq("channel", "sms")
            .eq("phone_e164", phoneE164)
            .maybeSingle();

          if (!existing) {
            // Insert unsubscribe record
            const { error: unsubError } = await supabase
              .from("unsubscribes")
              .insert({
                account_id: customer.account_id,
                channel: "sms",
                phone_e164: phoneE164,
                reason: "SMS keyword: STOP",
              });

            if (unsubError) {
              console.error("Unsubscribe insert error:", unsubError);
            }
          }
        }

        // Revoke consent for all customers
        const customerIds = customers.map((c) => c.id);
        const { error: consentError } = await supabase
          .from("consents")
          .insert(
            customerIds.map((customerId) => ({
              customer_id: customerId,
              channel: "sms",
              status: "revoked",
              captured_via: "sms",
            }))
          );

        if (consentError) {
          console.error("Consent revoke error:", consentError);
        }
      }

      return new Response(
        "You have been unsubscribed. You will no longer receive messages.",
        { status: 200, headers: corsHeaders }
      );
    }

    // Unknown keyword
    return new Response(
      "Unknown command. Reply JOIN to subscribe or STOP to unsubscribe.",
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error processing SMS webhook:", error);
    return new Response(
      "Internal server error",
      { status: 500, headers: corsHeaders }
    );
  }
});

