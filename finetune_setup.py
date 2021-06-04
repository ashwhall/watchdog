import numpy as np
import os
import shutil
import csv

"""
Download the Kaggle dog breed dataset from kaggle.com/c/dog-breed-identification/data, then run this file to prepare for
fine tuning. If it file executes without any hiccups, you're good to go!

Note that although the Kaggle dataset includes a test set, we don't have the labels so we ignore this
partition and make our own train, validation, test splits from the training set at 80%/10%/10%.
"""

data_dir = 'data'
in_labels_path = os.path.join(data_dir, 'labels.csv')
in_train_path = os.path.join(data_dir, 'train')
out_labels_path = os.path.join(data_dir, 'partitioned', 'labels.csv')
out_train_path = os.path.join(data_dir, 'partitioned', 'train')
out_val_path = os.path.join(data_dir, 'partitioned', 'val')
out_test_path = os.path.join(data_dir, 'partitioned', 'test')


def validate_unzipped():
    for path in (in_labels_path, in_train_path):
        if not os.path.exists(path):
            filename = os.path.split(path)[1]
            raise FileNotFoundError(f'{filename} not found. This should be unzipped to: {path}')


def move_image(name, class_name, target_dir):
    filename = f'{name}.jpg'
    source_path = os.path.join(in_train_path, filename)
    if not os.path.exists(source_path):
        raise FileNotFoundError(f'Image not found at {source_path}')

    class_dir = os.path.join(target_dir, class_name)
    os.makedirs(class_dir, exist_ok=True)

    target_path = os.path.join(class_dir, filename)

    shutil.copy(source_path, target_path)


def random_partition(array, train_percent, val_percent, test_percent, seed=42):
    if train_percent + val_percent + test_percent != 1:
        raise ValueError('Partition percentages must sum to 1')

    test_len = round(len(array) * test_percent)
    val_len = round(len(array) * val_percent)

    np.random.seed(seed)
    all_indices = np.random.permutation(len(array))
    test_indices, all_indices = all_indices[0:test_len], all_indices[test_len:]
    val_indices, all_indices = all_indices[0:val_len], all_indices[val_len:]
    train_indices = all_indices

    train_split = [array[i] for i in train_indices]
    val_split = [array[i] for i in val_indices]
    test_split = [array[i] for i in test_indices]

    return train_split, val_split, test_split


def assemble_class_directories():
    with open(in_labels_path, 'r') as f:
        rows = list(csv.reader(f))
        rows = rows[1:]  # Drop the header row

    train, val, test = random_partition(rows, 0.8, 0.1, 0.1)

    for split, split_dir in zip((train, val, test), (out_train_path, out_val_path, out_test_path)):
        os.makedirs(split_dir, exist_ok=True)
        for [name, class_name] in split:
            move_image(name, class_name, split_dir)

    classes = list(sorted(os.listdir(out_train_path)))
    with open(out_labels_path, 'w') as f:
        writer = csv.writer(f)
        for i, c in enumerate(classes):
            writer.writerow((i, c))


def run():
    validate_unzipped()
    assemble_class_directories()
    print('Setup completed successfully.')


if __name__ == '__main__':
    run()
