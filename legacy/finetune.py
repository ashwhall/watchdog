import flash
from flash.image import ImageClassificationData, ImageClassifier

"""Fine tunes a dog detector. Ensure you read the instructions and run finetune_setup.py"""


datamodule = ImageClassificationData.from_folders(
    train_folder='data/partitioned/train/',
    val_folder='data/partitioned/val/',
    test_folder='data/partitioned/test/',
    batch_size=8,
)

model = ImageClassifier(num_classes=datamodule.num_classes, backbone='resnext101_32x8d')

# Fine tune on the second GPU (change as required)
trainer = flash.Trainer(max_epochs=1, gpus=[1])
trainer.finetune(model, datamodule=datamodule, strategy='freeze')

# Save model checkpoint
trainer.save_checkpoint('breed_classifier.pt')
