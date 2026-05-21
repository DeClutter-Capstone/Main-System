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
    """Compose the image-edit prompt.

    Minimalist is special-cased with a strict "only remove, never add" rule
    — it's the flagship style and the whole point of DeClutter. Other
    styles (Modern, Scandinavian, Industrial, Bohemian, Rustic, Spa, or any
    user-supplied label) are free to add the decor that *defines* them, so
    long as the room's structure (walls, windows, layout) stays intact.
    """
    room_label = (room_type or "room").replace("_", " ").strip().lower()
    style_label = (style_name or "minimalist").replace("_", " ").strip().lower()

    if style_label == "minimalist":
        prompt = (
            f"Transform this {room_label} into a minimalist version. "
            "Remove all clutter, laundry, decorative items, throw pillows, rugs, "
            "excessive ornaments, and non-essential objects. If furniture is "
            "overly ornate, simplify its appearance. Do not add any new furniture, "
            f"objects, decorations, or elements that are not already present in the {room_label}. "
            "Keep the same room layout, same walls, same windows, same structural "
            "elements, same lighting. Only remove and simplify — never add."
        )
    else:
        style_desc = STYLE_DESCRIPTIONS.get(style_label, "")
        descriptor = f" — {style_desc}" if style_desc else ""
        prompt = (
            f"Redesign this {room_label} in a {style_label} style{descriptor}. "
            "Keep the same camera angle, same room layout, same walls, same windows, "
            "and same structural elements. You may change or add furniture, decor, "
            "textiles, lighting fixtures, and accessories so the space clearly reflects "
            f"the {style_label} aesthetic. Photorealistic."
        )

    if extra_prompt:
        prompt += f" {extra_prompt}"

    return prompt


# Generation quality → model. Auto and v1.5 both use the default flow
# (gpt-image-1.5). Anything unknown/missing falls back to auto.
_QUALITY_MODELS = {
    "auto": "gpt-image-1.5",
    "v1.0": "gpt-image-1-mini",
    "v1.5": "gpt-image-1.5",
    "v2.0": "gpt-image-2",
}


def generate_image(
    input_image_path: Path,
    room_type: str,
    style_name: str,
    extra_prompt: str = "",
    quality: str = "auto",
) -> str:
    """
    Call OpenAI to transform a room image. `quality` selects the model
    (auto/v1.5 → gpt-image-1.5, v1.0 → gpt-image-1-mini, v2.0 → gpt-image-2);
    unknown values default to auto.

    Passes `size="auto"` so GPT picks the output dimensions that best fit
    the content — the frontend then center-crops the original input to
    match whatever shape comes back.
    """
    model = _QUALITY_MODELS.get((quality or "auto").lower(), "gpt-image-1.5")
    prompt = build_prompt(room_type, style_name, extra_prompt)
    print(f"OpenAI prompt (model={model}, auto size): {prompt}")

    with open(input_image_path, "rb") as image_file:
        response = client.images.edit(
            model=model,
            image=image_file,
            prompt=prompt,
            n=1,
            size="auto",
        )

    return response.data[0].b64_json
