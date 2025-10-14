# Urban-Mobility-Data-Explorer

## 📦 Dataset Setup

The NYC Taxi Trip Duration dataset is too large for GitHub.  
To prepare the data locally:

```bash
kaggle competitions download -c nyc-taxi-trip-duration
unzip nyc-taxi-trip-duration.zip -d backend/src/data/raw/
