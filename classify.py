import datetime
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F
from torchvision.models import resnext101_32x8d as Classifier
from torchvision import transforms as T

from labels import LABELS, DESIRED
import database as db

FIRST_IDX = 151
LAST_IDX = 285
filtered_labels = []
for i in range(FIRST_IDX, LAST_IDX + 1):
    filtered_labels.append(LABELS[i])
filtered_desires = [d - FIRST_IDX for d in DESIRED]

model = None
transform = T.Compose([T.Resize(256),
                       T.FiveCrop(224),
                       T.Lambda(lambda crops: torch.stack([T.ToTensor()(crop) for crop in crops])),
                       T.Normalize(mean=[0.485, 0.456, 0.406],
                                   std=[0.229, 0.224, 0.225])])

def load_image(path):
    img = Image.open(path)
    return transform(img).cuda()

def classify_with_path(path):
    return classify(load_image(path))


def _combine_preds_mean(predictions):
    """Combine predictions by taking the mean probability over the batch"""
    preds = F.softmax(predictions, 1)
    return torch.mean(preds, 0)

def _combine_preds_max(predictions):
    """Combine preds by taking the max probability (pre-softmax) over the batch"""
    predictions = torch.max(predictions, 0)[0]
    predictions = F.softmax(predictions, 0)
    return predictions

def _is_dog_or_cat(predictions):
    predictions = _combine_preds_mean(predictions)

    top3 = torch.topk(predictions, 3)[1].detach().cpu().numpy()
    top10 = torch.topk(predictions, 10)[1].detach().cpu().numpy()
    pred_labels = [LABELS[i] for i in top3]
    for i in top10:
        if FIRST_IDX <= i <= LAST_IDX:
            return True, pred_labels
    return False, pred_labels

def _process_preds(predictions):
    dog_or_cat, classes = _is_dog_or_cat(predictions)
    if not dog_or_cat:
        return False, classes

    predictions = predictions[:, FIRST_IDX:LAST_IDX + 1]
    predictions = _combine_preds_max(predictions)
    top3 = torch.topk(predictions, 3)[1].detach().cpu().numpy()
    pred_labels = [filtered_labels[i] for i in top3]
    is_desired = any(i in filtered_desires for i in top3)
    return is_desired, pred_labels


def classify(image):
    global model
    if model is None:
        model = Classifier(pretrained=True).cuda()

    preds = model(image)
    is_desired, pred_labels = _process_preds(preds)
    return is_desired, pred_labels

if __name__ == '__main__':
    for url, info in db.get_unclassified().items():
        print(info['img'])
        img_data = load_image(info['img'])
        desired = classify(img_data)


