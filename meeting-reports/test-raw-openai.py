#!/usr/bin/env python3
"""
Test de debug pour voir la réponse brute d'OpenAI
"""

import sys
from pathlib import Path

# Add backend directory to path
sys.path.append(str(Path(__file__).parent / "backend"))

from openai_summarizer import summarizer
import openai

def test_raw_openai():
    """Test de debug de la réponse brute d'OpenAI"""
    print("=== Test de debug de la réponse brute OpenAI ===")
    
    long_transcript = """Et nous, nous sommes juste en train de rattraper ces idées. Chaque nuit, une lutte s'engage dans le ciel. Un combat pour la survie entre les chauves-souris et les papillons de nuit. En Arizona, des scientifiques tentent d'observer cette bataille nocturne. Pour étudier les chauves-souris et les insectes, nous devons rester éveillés toute la nuit et devenir comme eux. Nous commençons quand la nuit tombe, et nous travaillons jusqu'à la nuit. En faisant ça, on a la chance d'observer des animaux que peu de gens ont vus ou étudiés avant le réveil. En faisant ça, on a la chance d'observer des animaux que peu de gens ont vus ou étudiés avant le réveil. On va voir ce qu'il y a sur le drap. Une belle diversité. Ouais. Oh, allons celui-là. Alors, est-ce qu'on peut le mettre dans le pot ? Oui, je voudrais vraiment le lâcher dans la tente avec les chauves-souris. Et voilà. Alors, qu'est-ce qu'on a d'autre ? Le biologiste Aaron Corcoran étudie les interactions proie-prédateur entre les papillons de nuit et les chauves-souris. Le chercheur va tester les performances de vol des chauves-souris face à ces insectes. C'est une noctuelle. Elle a des oreilles adaptées aux fréquences des chauves-souris. Quand ce papillon entend une chauve-souris arriver, il plonge pour l'esculer avant qu'elle ne l'attrape. Essayons de la faire entrer dans le pot. Voilà. All right, OK. On a plein de friandises pour les chauves-souris. Pendant ce temps, une seconde équipe capture les prédateurs. Oh mon dieu, il y en a une ici. Je ne l'avais même pas vue. Les chauves-souris. On dirait bien une sérotine, Brun. La nuit prochaine, les scientifiques vont lâcher cette chauve-souris, à la poursuite des insectes capturés par Aaron. Le jour se lève sur le site de recherche. Nous sommes au cœur des montagnes Jirikawa, dans le sud de la région. L'équipe de biologistes prépare l'expérience du soir. Les chauves-souris et les insectes sont incroyablement difficiles à étudier. Ils volent au-dessus des moules à nuit quand nous ne pouvons pas les voir. Et nous sommes parmi les premiers au monde à amener toute cette technologie en milieu naturel et à pouvoir filmer ces animaux sur le terrain. Ce dispositif vidéo infrarouge a nécessité dix ans de mise au point. Il doit enregistrer la chasse nocturne des chauves-souris. Impossible à suivre à l'œil nu. À la nuit tombée, l'expérience commence enfin pour Aaron et ses collègues. Le jour se lève sur le site de recherche. Nous sommes au cœur des montagnes Jirikawa, dans le sud de la région. Les chauves-souris et les insectes sont incroyablement difficiles à étudier. Ils volent au-dessus des moules à nuit quand nous ne pouvons pas les voir. Et nous sommes parmi les premiers au monde à amener toute cette technologie en milieu naturel et à pouvoir filmer ces animaux sur le terrain. L'expérience commence enfin pour Aaron et ses collègues. À peine relâchée, cette chauve-souris rousse se lance à la poursuite des papillons."""
    
    try:
        # Appel direct à l'API OpenAI
        client = openai.OpenAI(api_key=summarizer.api_key)
        
        prompt = f"""
Analyze this meeting transcript and provide a structured summary in French.

Transcript:
{long_transcript}

Provide your response in the following JSON format:
{{
    "summary": "Concise meeting summary in 2-3 sentences",
    "key_points": ["Key point 1", "Key point 2", "Key point 3"],
    "action_items": ["Action 1", "Action 2", "Action 3"],
    "participants": ["Participant 1", "Participant 2"],
    "decisions": ["Decision 1", "Decision 2"],
    "next_steps": "Recommended next steps"
}}

Ensure that:
- The summary is concise and informative
- Key points are the most important ones
- Actions are specific and measurable
- Participants are identified if possible
- Decisions are clearly stated
"""
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Tu es un assistant spécialisé dans le résumé de réunions en français."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        raw_response = response.choices[0].message.content
        print(f"Réponse brute d'OpenAI:")
        print(f"Longueur: {len(raw_response)} caractères")
        print(f"Contenu: {raw_response}")
        
        # Test du parsing
        print(f"\nTest du parsing JSON:")
        try:
            import json
            parsed = json.loads(raw_response)
            print(f"Parsing réussi: {list(parsed.keys())}")
        except json.JSONDecodeError as e:
            print(f"Erreur de parsing JSON: {e}")
            
    except Exception as e:
        print(f"Erreur lors de l'appel OpenAI: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_raw_openai()


















































