// pages/api/appointments/book.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      phone,
      customer_name,
      service_type_id,
      start_time,
      duration_minutes = 60,
      notes,
      business_id = process.env.BUSINESS_ID
    } = req.body;

    console.log('📞 Booking request:', { phone, customer_name, start_time });

    // Validate required fields
    if (!phone || !start_time) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: phone and start_time are required'
      });
    }

    // Calculate end time
    const startDate = new Date(start_time);
    const endDate = new Date(startDate.getTime() + duration_minutes * 60000);

    // Find or create customer
    const { data: customerId, error: customerError } = await supabase
      .rpc('find_or_create_customer', {
        p_business_id: business_id,
        p_phone: phone,
        p_name: customer_name
      });

    if (customerError) {
      console.error('❌ Customer error:', customerError);
      return res.status(500).json({ 
        success: false,
        error: customerError.message 
      });
    }

    console.log('✅ Customer ID:', customerId);

    // Check for conflicts
    const { data: hasConflict, error: conflictError } = await supabase
      .rpc('check_appointment_conflict', {
        p_business_id: business_id,
        p_start_time: startDate.toISOString(),
        p_end_time: endDate.toISOString()
      });

    if (conflictError) {
      console.error('❌ Conflict check error:', conflictError);
      return res.status(500).json({ 
        success: false,
        error: conflictError.message 
      });
    }

    if (hasConflict) {
      console.log('⚠️  Time slot conflict');
      return res.status(409).json({
        success: false,
        error: 'This time slot is already booked. Please choose another time.',
        code: 'CONFLICT'
      });
    }

    // Create appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        business_id,
        customer_id: customerId,
        service_type_id,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        status: 'scheduled',
        notes,
        created_by: 'vapi_agent'
      })
      .select(`
        *,
        customer:customers(name, phone),
        service:service_types(name, duration_minutes)
      `)
      .single();

    if (appointmentError) {
      console.error('❌ Appointment error:', appointmentError);
      return res.status(500).json({ 
        success: false,
        error: appointmentError.message 
      });
    }

    console.log('✅ Appointment created:', appointment.id);

    // Format response for Vapi agent
    const formattedDate = startDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return res.status(201).json({
      success: true,
      appointment: {
        id: appointment.id,
        customer_name: appointment.customer.name,
        phone: appointment.customer.phone,
        service: appointment.service?.name || 'Service',
        date: formattedDate,
        time: formattedTime,
        start_time: appointment.start_time,
        end_time: appointment.end_time
      },
      message: `Perfect! I've booked your appointment for ${formattedDate} at ${formattedTime}.`
    });

  } catch (error) {
    console.error('❌ Booking error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}
