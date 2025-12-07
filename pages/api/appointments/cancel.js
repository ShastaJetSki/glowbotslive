// pages/api/appointments/cancel.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      appointment_id,
      phone,
      reason = 'Customer requested cancellation'
    } = req.body;

    console.log('❌ Cancel request:', { appointment_id, phone });

    // Must provide either appointment_id or phone
    if (!appointment_id && !phone) {
      return res.status(400).json({
        success: false,
        error: 'Must provide either appointment_id or phone number'
      });
    }

    let appointmentToCancel;

    // If phone provided, find their next appointment
    if (phone && !appointment_id) {
      const { data: appointments, error: lookupError } = await supabase
        .rpc('get_customer_appointments', {
          p_business_id: process.env.BUSINESS_ID,
          p_phone: phone,
          p_include_past: false
        });

      if (lookupError || !appointments || appointments.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No upcoming appointments found for this phone number'
        });
      }

      // Cancel the first (next) appointment
      appointmentToCancel = appointments[0].appointment_id;
    } else {
      appointmentToCancel = appointment_id;
    }

    // Cancel the appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: reason
      })
      .eq('id', appointmentToCancel)
      .select(`
        *,
        customer:customers(name, phone),
        service:service_types(name)
      `)
      .single();

    if (error) {
      console.error('❌ Cancel error:', error);
      return res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }

    if (!appointment) {
      return res.status(404).json({ 
        success: false,
        error: 'Appointment not found' 
      });
    }

    console.log('✅ Appointment cancelled:', appointment.id);

    // Format response for agent
    const startTime = new Date(appointment.start_time);
    const formattedDate = startTime.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = startTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return res.status(200).json({
      success: true,
      appointment: {
        id: appointment.id,
        customer_name: appointment.customer.name,
        phone: appointment.customer.phone,
        service: appointment.service?.name,
        date: formattedDate,
        time: formattedTime,
        status: 'cancelled'
      },
      message: `Your appointment for ${formattedDate} at ${formattedTime} has been cancelled.`
    });

  } catch (error) {
    console.error('❌ Cancel error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}
