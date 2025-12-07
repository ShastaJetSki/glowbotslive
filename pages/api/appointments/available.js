// pages/api/appointments/available.js
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
      date, 
      duration_minutes = 60,
      business_id = process.env.BUSINESS_ID 
    } = req.query;

    console.log('📅 Availability request:', { date, duration_minutes });

    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: date (format: YYYY-MM-DD)'
      });
    }

    // Get available slots using database function
    const { data: slots, error } = await supabase
      .rpc('get_available_slots', {
        p_business_id: business_id,
        p_date: date,
        p_duration_minutes: parseInt(duration_minutes)
      });

    if (error) {
      console.error('❌ Availability error:', error);
      return res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }

    // Filter to only available slots
    const availableSlots = slots
      .filter(slot => slot.is_available)
      .map(slot => {
        const slotTime = new Date(slot.slot_time);
        return {
          time: slotTime.toISOString(),
          formatted: slotTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        };
      });

    console.log(`✅ Found ${availableSlots.length} available slots`);

    // Format response for Vapi agent
    if (availableSlots.length === 0) {
      return res.status(200).json({
        success: true,
        date,
        available_slots: [],
        count: 0,
        message: `Sorry, we don't have any available appointments on ${date}. Would you like to try a different day?`
      });
    }

    // Create human-readable list of times
    const timeList = availableSlots
      .map(slot => slot.formatted)
      .join(', ');

    return res.status(200).json({
      success: true,
      date,
      available_slots: availableSlots,
      count: availableSlots.length,
      message: `For ${date}, we have appointments available at: ${timeList}.`
    });

  } catch (error) {
    console.error('❌ Available slots error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}
