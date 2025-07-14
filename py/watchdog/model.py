
# grab model checkpoint from huggingface hub
from huggingface_hub import hf_hub_download
import torch

from open_flamingo import create_model_and_transforms


def load_model():
    print('Creating model...')
    model, image_processor, tokenizer = create_model_and_transforms(
        clip_vision_encoder_path="ViT-B-16-quickgelu",
        clip_vision_encoder_pretrained="openai",
        lang_encoder_path="togethercomputer/RedPajama-INCITE-Instruct-3B-v1",
        tokenizer_path="togethercomputer/RedPajama-INCITE-Instruct-3B-v1",
        cross_attn_every_n_layers=1,
        cache_dir="/data/cache"  # Defaults to ~/.cache
    )

    print('Downloading model checkpoint...')
    checkpoint_path = hf_hub_download(
        "openflamingo/OpenFlamingo-3B-vitl-mpt1b", "/data/weights/checkpoint.pt")

    print('Loading model checkpoint...')
    model.load_state_dict(torch.load(checkpoint_path), strict=False)

    print('Done!')
