import os
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# What each style looks like
STYLE_DESCRIPTIONS = {
    "modern": (
        "sleek and contemporary design with clean straight lines, neutral color palette of whites, grays, and blacks, "
        "minimalist high-end furniture, polished surfaces, recessed lighting, and an open airy feel"
    ),
    "minimalist": (
        "stripped back to only the essentials, pure white walls, hidden storage, no clutter anywhere, "
        "very few pieces of furniture, calm and serene atmosphere, monochromatic tones"
    ),
    "scandinavian": (
        "bright and cozy with light natural wood tones, white walls, soft wool and linen textures, "
        "hygge warmth, simple functional furniture, muted pastel accents, lots of natural light"
    ),
    "industrial": (
        "raw urban aesthetic with exposed brick walls, visible metal pipes and ducts, dark iron fixtures, "
        "Edison bulb lighting, reclaimed wood surfaces, concrete floors, moody and edgy atmosphere"
    ),
    "bohemian": (
        "eclectic and free-spirited with layered colorful textiles, macrame wall hangings, lots of indoor plants, "
        "mix of patterns and global influences, warm earthy tones, rattan and wicker furniture, candles and lanterns"
    ),
    "rustic": (
        "warm and cozy cabin feel with exposed wooden beams, stone fireplace, rough-hewn wood furniture, "
        "earthy browns and greens, plaid and wool textiles, antler or wrought iron accents, natural materials throughout"
    ),
    "spa": (
        "serene luxury spa atmosphere with clean whites and soft stone tones, natural pebbles and bamboo accents, "
        "soft warm lighting, floating candles, lush green plants, calm zen energy, polished marble or travertine surfaces"
    ),
}

# What each room should emphasize
ROOM_CONTEXT = {
    "bedroom": (
        "Focus on the bed as the centerpiece, bedside tables, soft lighting, wardrobe or storage, "
        "cozy rugs and curtains."
    ),
    "living_room": (
        "Focus on the sofa arrangement, coffee table, TV area or focal wall, rugs, curtains, "
        "and decorative lighting."
    ),
    "kitchen": (
        "Focus on the cabinetry style, countertops, backsplash, island or dining area, "
        "appliances finish, and lighting above the counter."
    ),
    "bathroom": (
        "Focus on the vanity, tiles, bathtub or shower area, mirrors, towels and accessories, "
        "and ambient lighting."
    ),
    "spa": (
        "Focus on the relaxation area, soaking tub if present, steam elements, ambient lighting, "
        "natural stone or wood surfaces, and calming decor."
    ),
}


def build_prompt(room_type: str, style_name: str, extra_prompt: str = "") -> str:
    room_label = room_type.replace("_", " ")
    style_desc = STYLE_DESCRIPTIONS.get(style_name, style_name)
    room_context = ROOM_CONTEXT.get(room_type, "")

    prompt = (
        f"You are an interior designer. Redesign this {room_label} in a {style_name} style. "
        f"Style characteristics: {style_desc}. "
        f"{room_context} "
        f"STRICT RULES — you must follow all of these exactly: "
        f"1. Do NOT change the camera angle, viewpoint, or perspective in any way. "
        f"2. Do NOT change the room shape, size, proportions, or layout. "
        f"3. Do NOT move or remove any walls, windows, doors, or ceiling. "
        f"4. Do NOT change the floor plan or spatial structure. "
        f"5. ONLY change the furniture style, surface materials, colors, textures, decor items, and lighting fixtures. "
        f"6. Every architectural element must stay in the exact same position as the original photo. "
        f"The final image must look like a professional interior design photograph taken from the exact same position as the original."
    )

    if extra_prompt:
        prompt += f" Additional requirements: {extra_prompt}"

    return prompt


def generate_image(input_image_path: Path, room_type: str, style_name: str, extra_prompt: str = "") -> str:
    """
    Call OpenAI gpt-image-2 to transform a room image.
    Returns raw base64-encoded PNG string.
    """
    prompt = build_prompt(room_type, style_name, extra_prompt)
    print(f"OpenAI prompt: {prompt}")

    with open(input_image_path, "rb") as image_file:
        response = client.images.edit(
            model="gpt-image-1",
            image=image_file,
            prompt=prompt,
            n=1,
            size="512x512",
            quality="low",
        )

    return response.data[0].b64_json
