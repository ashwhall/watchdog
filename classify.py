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

def classify(image):
    global model
    if model is None:
        model = Classifier(pretrained=True).cuda()

    preds = model(image)
    # Reduce to only dog classes
    preds = preds[:, FIRST_IDX:LAST_IDX+1]
    preds = F.softmax(preds, 1)
    preds = preds.detach().cpu().numpy()
    preds = np.mean(preds, 0)
    top3 = preds.argsort()[-3:][::-1]

    pred_classes = [filtered_labels[i] for i in top3]
    return any(i in filtered_desires for i in top3), pred_classes

if __name__ == '__main__':
    for url, info in db.get_unclassified().items():
        img_data = load_image(info['img'])
        db.set_desired(url, classify(img_data))


