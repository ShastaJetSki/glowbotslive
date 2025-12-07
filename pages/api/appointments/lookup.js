// pages/api/appointments/lookup.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      phone,
      business_id = process.env.BUSINESS_ID 
    } = req.query;

    console.log('🔍 Lookup request:', { phone });

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: phone'
      });
    }

    // Get customer appointments
    const { data: appointments, error } = await supabase
      .rpc('get_customer_appointments', {
        p_business_id: business_id,
        p_phone: phone,
        p_include_past: false // Only future appointments
      });

    if (error) {
      console.error('❌ Lookup error:', error);
      return res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }

    if (!appointments || appointments.length === 0) {
      console.log('ℹ️  No appointments found');
      return res.status(200).json({
        success: true,
        phone,
        appointments: [],
        count: 0,
        message: `I don't see any upcoming appointments for ${phone}. Would you like to schedule one?`
      });
    }

    console.log(`✅ Found ${appointments.length} appointment(s)`);

    // Format appointments for agent
    const formattedAppointments = appointments.map(apt => {
      const startTime = new Date(apt.start_time);
      return {
        id: apt.appointment_id,
        service: apt.service_name,
        date: startTime.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        time: startTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        status: apt.status,
        notes: apt.notes
      };
    });

    // Create message for agent
    let message;
    if (appointments.length === 1) {
      const apt = formattedAppointments[0];
      message = `You have one upcoming appointment: ${apt.service} on ${apt.date} at ${apt.time}.`;
    } else {
      message = `You have ${appointments.length} upcoming appointments. `;
      formattedAppointments.forEach((apt, index) => {
        message += `${index + 1}. ${apt.service} on ${apt.date} at ${apt.time}. `;
      });
    }

    return res.status(200).json({
      success: true,
      phone,
      appointments: formattedAppointments,
      count: appointments.length,
      message
    });

  } catch (error) {
    console.error('❌ Lookup error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}
