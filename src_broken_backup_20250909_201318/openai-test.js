import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say hello from OpenAI!' }
      ]
    });
    console.log('OpenAI response:', response.choices[0].message.content);
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
  }
}

main();
