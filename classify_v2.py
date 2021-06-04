import os
import csv
import torch
import torch.nn.functional as F
from flash.core.classification import Logits
from torchvision.models import resnext101_32x8d as IsDogClassifier
from flash.image import ImageClassifier
from PIL import Image

from classify import load_image, _combine_preds_mean
import database as db

is_dog_model = None
breed_model = None

with open(os.path.join('data', 'partitioned', 'labels.csv'), 'r') as f:
    breed_labels = [breed for idx, breed in csv.reader(f)]

with open(os.path.join('desired_breeds.csv'), 'r') as f:
    desired_indices = [int(idx) for idx, breed in csv.reader(f)]

PROB_THRESH = 0.5
imgnet_first_dog_idx = 152  # We're actually skipping Chihuahua as the classifier's a bit overzealous with predicting it
imgnet_last_dog_idx = 280

def top_n_probs(predictions, k):
    """Get the top k, then remove all that are less than .75x as high probability as the most probable"""
    # Get the top k
    topk_probs, topk_indices = torch.topk(predictions, k)
    # Filter the top three to be only those that are at least .75x as likely as top1
    top_n_indices = []
    top_n_probabilities = []
    for prob, idx in zip(topk_probs, topk_indices):
        if prob / topk_probs[0] >= PROB_THRESH:
            top_n_indices.append(int(idx.detach().cpu().numpy()))
            top_n_probabilities.append(float(prob.detach().cpu().numpy()))
    return top_n_indices, topk_probs


def _is_dog(img_path):
    """Returns true if the top5 imagenet predictions contain a dog class"""
    img = load_image(img_path)
    preds = _combine_preds_mean(is_dog_model(img))
    _, top_10_indices = torch.topk(preds, 10)
    for i in top_10_indices:
        if 152 <= i <= 280:
            return True
    return False


def _process_preds(predictions):
    predictions = F.softmax(predictions[None], 1)[0]
    top_n_3_indices, top_n_3_probs = top_n_probs(predictions, 3)

    pred_labels = [breed_labels[i] for i in top_n_3_indices]
    is_desired = any(i in desired_indices for i in top_n_3_indices)
    return is_desired, pred_labels


def classify(img_path):
    global breed_model, is_dog_model
    if breed_model is None:
        breed_model = ImageClassifier.load_from_checkpoint('breed_classifier.pt').cuda()
        breed_model.serializer = Logits()
    if is_dog_model is None:
        is_dog_model = IsDogClassifier(pretrained=True).cuda()

    if not _is_dog(img_path):
        return False, []
    preds = torch.tensor(breed_model.predict([img_path]))[0]

    is_desired, pred_labels = _process_preds(preds)
    return is_desired, pred_labels


if __name__ == '__main__':
    import matplotlib.pyplot as plt
    for url, info in db.get_unclassified().items():
        desired, breeds = classify(info['img'])

        img = Image.open(info['img']).convert('RGB')
        plt.imshow(img)
        plt.title(f'{", ".join(breeds)} ({"YES" if desired else "NO"})')
        plt.show()
