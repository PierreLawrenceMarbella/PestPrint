# PestPrint

## Rice Crop Damage Identification System

PestPrint is an image classification prototype designed to identify rice crop damage signatures using a deep learning model.

The system accepts an image of a rice plant and predicts one of the following categories:

- **Healthy Rice**
- **Rice Leaffolder**
- **Rice Stem Borer**
- **Unknown**

The system uses **EfficientNet-B0** with transfer learning and a Flask-based web application.

---

## Features

- Upload a rice plant image through the web interface
- Preview the selected image
- Analyze the image using the trained EfficientNet-B0 model
- Display the predicted class
- Display the model's confidence level
- Handle images that do not clearly belong to the target classes
- Responsive web interface

---

## Technologies Used

### Machine Learning
- Python
- PyTorch
- Torchvision
- EfficientNet-B0

### Backend
- Flask

### Image Processing
- Pillow

### Frontend
- HTML
- CSS
- JavaScript
- Bootstrap

---

## Project Structure

PestPrint/
│
├── dataset/
│   ├── training/
│   ├── validation/
│   └── testing/
│
├── model/
│   └── efficientnet_b0_rice_pest.pth
│
├── static/
│   └── style.css
│
├── templates/
│   └── index.html
│
├── app.py
├── train.py
├── test.py
├── requirements.txt
├── .gitignore
└── README.md


---

# Installation

## 1. Clone the Repository

Open a terminal and run:

git clone <YOUR_GITHUB_REPOSITORY_URL>


Then enter the project folder:

cd PestPrint


---

## 2. Create a Virtual Environment

Create a Python virtual environment:

python -m venv .venv


### Windows PowerShell

Activate the environment:

.venv\Scripts\Activate.ps1


If PowerShell prevents the activation script from running, use Command Prompt instead:

.venv\Scripts\activate


After activation, the terminal should show something similar to:

(.venv) PS C:\...\PestPrint>


---

## 3. Install Dependencies

Install the required Python packages:

pip install -r requirements.txt


The project requires:

- PyTorch
- Torchvision
- Flask
- Pillow

---

## 4. PyTorch GPU Installation

If you have an NVIDIA GPU and want to use CUDA acceleration, install the appropriate PyTorch CUDA version.

For the current development environment, the project has been tested with the CUDA 12.6 PyTorch installation:

python -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cu126


Then install the remaining dependencies:

pip install Flask Pillow


To check whether PyTorch can detect the GPU:

python -c "import torch; print(torch.cuda.is_available())"

If the output is:

True


CUDA is available.

If it outputs:

False


the project can still run using the CPU.

---

# Required Project Files

The GitHub repository does not contain the dataset or trained model because these files can be large.

Before running the application, make sure you have the following:

dataset/
model/efficientnet_b0_rice_pest.pth


The dataset should follow this structure:

dataset/
├── training/
│   ├── healthy_rice/
│   ├── rice_leaffolder/
│   ├── rice_stem_borer/
│   └── unknown/
│
├── validation/
│   ├── healthy_rice/
│   ├── rice_leaffolder/
│   ├── rice_stem_borer/
│   └── unknown/
│
└── testing/
    ├── healthy_rice/
    ├── rice_leaffolder/
    ├── rice_stem_borer/
    └── unknown/


The trained model should be placed at:

model/efficientnet_b0_rice_pest.pth


### Obtaining the Dataset and Model

Team members should obtain the dataset and trained model from the team's shared storage.

**Do not commit the dataset or `.pth` model to GitHub unless the team decides to use Git LFS or another appropriate storage method.**

---

# Running the Web Application

After installing the dependencies and placing the required model file in the correct location, run:

python app.py


The Flask server should start.

Open the following address in your browser:

http://127.0.0.1:5000


The PestPrint web application should then be available.

---

# Using the Application

1. Open the PestPrint website.
2. Click **Choose Image**.
3. Select an image of a rice plant.
4. Preview the selected image.
5. Click **Analyze Image**.
6. Wait for the model to process the image.
7. View the predicted class and confidence level.

Possible predictions:

| Class | Description |
|---|---|
| `healthy_rice` | Rice plants without visible relevant damage |
| `rice_leaffolder` | Damage associated with rice leaffolder |
| `rice_stem_borer` | Damage associated with rice stem borer |
| `unknown` | Images that do not clearly belong to the target classes |

---

# Model

PestPrint uses **EfficientNet-B0** through Torchvision.

The model is configured for four output classes:

healthy_rice
rice_leaffolder
rice_stem_borer
unknown

The current application uses the original preprocessing pipeline:

transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])


No additional background-removal or segmentation preprocessing is required by the current application.

---

# Training the Model

To train the model:

python train.py


The trained model is saved as:

model/efficientnet_b0_rice_pest.pth


To evaluate the trained model:

python test.py

