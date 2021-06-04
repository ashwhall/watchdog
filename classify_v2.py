import os
import csv
import torch
import torch.nn.functional as F
from flash.core.classification import Logits
from flash.image import ImageClassifier
from PIL import Image

import database as db


model = None

with open(os.path.join('data', 'partitioned', 'labels.csv'), 'r') as f:
    breed_labels = [breed for idx, breed in csv.reader(f)]

with open(os.path.join('desired_breeds.csv'), 'r') as f:
    desired_indices = [int(idx) for idx, breed in csv.reader(f)]

PROB_THRESH = 0.5

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


def _is_dog(top_n_3):
    return sum(top_n_3) >= 0.6


def _process_preds(predictions):
    predictions = F.softmax(predictions[None], 1)[0]
    top_n_3_indices, top_n_3_probs = top_n_probs(predictions, 3)

    if not _is_dog(top_n_3_probs):
        return False, []

    pred_labels = [breed_labels[i] for i in top_n_3_indices]
    is_desired = any(i in desired_indices for i in top_n_3_indices)
    return is_desired, pred_labels


def classify(img_path):
    global model
    if model is None:
        model = ImageClassifier.load_from_checkpoint('breed_classifier.pt').cuda()
        model.serializer = Logits()

    preds = torch.tensor(model.predict([img_path]))[0]

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
