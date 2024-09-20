const axios = require('axios');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' }),
        };
    }

    try {
        const { nbPersonnes, preferences, dureeSejour } = JSON.parse(event.body);

        // Créer le prompt pour OpenAI
        const prompt = `
            Génère un menu pour ${dureeSejour} jours pour ${nbPersonnes} personnes.
            Préférences alimentaires: ${preferences}.
            Fournis également une liste de courses organisée par étals (Fruits, Légumes, Viandes, Épicerie, Produits Laitiers, etc.).
            
            Format de sortie:
            Menus:
            - Jour 1: [Plat]
            - Jour 2: [Plat]
            ...

            Liste de Courses:
            Fruits:
            - [Ingrédient]
            ...

            Légumes:
            - [Ingrédient]
            ...
        `;

        // Appeler l'API OpenAI
        const response = await axios.post('https://api.openai.com/v1/completions', {
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 1000,
            temperature: 0.7,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.Foodikey}`, // Utilisation de la clé API "Foodikey" de Netlify
            }
        });

        const generatedText = response.data.choices[0].text.trim();

        return {
            statusCode: 200,
            body: JSON.stringify({ menus: generatedText }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
        };
    }
};

