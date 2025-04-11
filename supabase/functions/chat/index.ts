import { createClient } from 'npm:@supabase/supabase-js@2.39.7'
import OpenAI from 'npm:openai@4.28.0'

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function getContext(userId: string) {
  // Get products
  const { data: products } = await supabase
    .from('products')
    .select('name, description, price, stock');
  
  // Get store policies
  const { data: policies } = await supabase
    .from('store_policies')
    .select('title, content');

  // Get user's orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId);

  return {
    products,
    policies,
    orders
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    const context = await getContext(userId);

    const systemPrompt = `
      You are an AI customer service assistant. Use the following context to answer customer queries:
      
      Products Available:
      ${JSON.stringify(context.products, null, 2)}
      
      Store Policies:
      ${JSON.stringify(context.policies, null, 2)}
      
      Customer's Orders:
      ${JSON.stringify(context.orders, null, 2)}
      
      Instructions:
      1. For order-related queries, use the customer's actual order data to provide specific responses
      2. For product queries, provide accurate pricing and availability information
      3. For policy questions, reference the actual store policies
      4. If information is not available, politely explain and suggest alternatives
      5. Always maintain a professional and helpful tone
      6. Format prices with currency symbol and two decimal places
      7. For order status, provide the date and current status
      
      Respond naturally and professionally. If you don't have information about something specific, 
      say so politely and offer to help with something else.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;

    // Store in chat history
    await supabase
      .from('chat_history')
      .insert([
        { user_id: userId, message, response }
      ]);

    return new Response(
      JSON.stringify({ response }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: "I apologize, but I couldn't process your request at the moment. Please try again or contact our support team if the issue persists." 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});