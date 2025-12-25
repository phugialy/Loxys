import { createClient } from '@/lib/supabase/server';
import type { TablesInsert, TablesUpdate } from '@/types/database.types';

/**
 * Normalize phone number to E.164 format
 */
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, assume US number and add +1
  if (!cleaned.startsWith('+')) {
    // Remove leading 1 if present
    const digits = cleaned.replace(/^1/, '');
    if (digits.length === 10) {
      return `+1${digits}`;
    }
  }
  
  return cleaned.startsWith('+') ? cleaned : null;
}

/**
 * Normalize email to lowercase
 */
export function normalizeEmail(email: string | null | undefined): string | null {
  return email ? email.toLowerCase().trim() : null;
}

/**
 * Get all customers for the current account
 */
export async function getCustomers(filters?: {
  status?: 'active' | 'archived';
  search?: string;
  birthMonth?: string;
  loyalty?: string;
}) {
  const supabase = await createClient();
  
  let query = supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase();
    query = query.or(
      `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone_e164.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`
    );
  }

  if (filters?.birthMonth) {
    // Filter by month extracted from date_of_birth (format: YYYY-MM-DD)
    // Use EXTRACT to get month from date_of_birth
    query = query.filter('date_of_birth', 'not.is', null);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch customers: ${error.message}`);
  }

  let customers = data || [];

  // Apply birth month filter in memory (Postgres EXTRACT is complex with nullable dates)
  if (filters?.birthMonth && customers.length > 0) {
    const targetMonth = parseInt(filters.birthMonth, 10);
    customers = customers.filter((customer) => {
      if (!customer.date_of_birth) return false;
      const [year, month] = customer.date_of_birth.split('-').map(Number);
      return month === targetMonth;
    });
  }

  // Apply loyalty filter in memory (based on days since created_at)
  if (filters?.loyalty && customers.length > 0) {
    const now = new Date();
    customers = customers.filter((customer) => {
      const createdAt = new Date(customer.created_at);
      const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (filters.loyalty) {
        case 'new':
          return daysSinceCreation <= 30;
        case 'regular':
          return daysSinceCreation > 30 && daysSinceCreation <= 90;
        case 'long-term':
          return daysSinceCreation > 90;
        default:
          return true;
      }
    });
  }

  return customers;
}

/**
 * Get a single customer by ID
 */
export async function getCustomerById(customerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch customer: ${error.message}`);
  }

  return data;
}

/**
 * Create a new customer
 * Database enforces uniqueness on:
 * - (account_id, name, phone_e164) - prevents same name + same phone
 * - (account_id, name, email) - prevents same name + same email
 * 
 * This allows:
 * ✅ Same phone with different names
 * ✅ Same email with different names
 * ❌ Same name + same phone (blocked)
 * ❌ Same name + same email (blocked)
 */
export async function createCustomer(
  customer: Omit<TablesInsert<'customers'>, 'account_id' | 'id' | 'created_at' | 'updated_at'>
) {
  const supabase = await createClient();

  // Get current account ID
  const { data: accountData, error: accountError } = await supabase
    .rpc('current_account_id');

  if (accountError || !accountData) {
    throw new Error('Failed to get account ID');
  }

  // Normalize inputs
  const normalizedCustomer: TablesInsert<'customers'> = {
    account_id: accountData,
    name: customer.name.trim(),
    phone_e164: normalizePhone(customer.phone_e164),
    email: normalizeEmail(customer.email),
    date_of_birth: customer.date_of_birth || null,
    notes: customer.notes?.trim() || null,
    status: customer.status || 'active',
  };

  const { data, error } = await supabase
    .from('customers')
    .insert(normalizedCustomer)
    .select()
    .single();

  if (error) {
    // Check if it's a unique constraint violation
    if (error.code === '23505') {
      // Unique constraint violation - name+phone or name+email combination already exists
      if (error.message.includes('name_phone')) {
        throw new Error('A customer with this name and phone number already exists');
      } else if (error.message.includes('name_email')) {
        throw new Error('A customer with this name and email already exists');
      }
    }
    throw new Error(`Failed to create customer: ${error.message}`);
  }

  return data;
}

/**
 * Update a customer
 */
export async function updateCustomer(
  customerId: string,
  updates: Partial<TablesUpdate<'customers'>>
) {
  const supabase = await createClient();

  // Normalize inputs if provided
  const normalizedUpdates: Partial<TablesUpdate<'customers'>> = { ...updates };
  
  if (updates.phone_e164 !== undefined) {
    normalizedUpdates.phone_e164 = normalizePhone(updates.phone_e164);
  }
  
  if (updates.email !== undefined) {
    normalizedUpdates.email = normalizeEmail(updates.email);
  }
  
  if (updates.name !== undefined) {
    normalizedUpdates.name = updates.name.trim();
  }

  if (updates.notes !== undefined) {
    normalizedUpdates.notes = updates.notes?.trim() || null;
  }

  // date_of_birth is already a date string, no normalization needed
  // Remove account_id from updates (cannot be changed)
  delete normalizedUpdates.account_id;

  const { data, error } = await supabase
    .from('customers')
    .update(normalizedUpdates)
    .eq('id', customerId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update customer: ${error.message}`);
  }

  return data;
}

/**
 * Archive a customer (soft delete)
 */
export async function archiveCustomer(customerId: string) {
  return updateCustomer(customerId, { status: 'archived' });
}

/**
 * Restore an archived customer
 */
export async function restoreCustomer(customerId: string) {
  return updateCustomer(customerId, { status: 'active' });
}

