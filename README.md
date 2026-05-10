# DeClutter - AI-Powered Interior Design Transformation

![Project Banner](docs/banner.png) 

**Capstone Graduation Project | CMSE 405 | Fall 2025-26**

DeClutter is an AI-powered interior design application that transforms room photographs into customized design styles using deep learning. Upload a photo of your room and instantly visualize it in different aesthetic styles with budget-aware furniture recommendations.

---

##  Features

###  **Style Transformations**
Transform your space into any of these design aesthetics:
- **Minimalist** - Clean, simple, clutter-free
- **Boho** - Eclectic, colorful, artistic
- **Industrial** - Raw, exposed materials, urban
- **Modern** - Contemporary, sleek, functional
- **Scandinavian** - Light, natural, cozy

###  **Supported Room Types**
- Bathrooms
- Bedrooms
- Kitchens
- Living Rooms

###  **AI Technologies**
- **GPT 2 Image**: Style transfer and room transformation
- **Budget Estimation**: AI-powered cost analysis for redesign

---

##  Team

| Name | Role | Responsibilities |
|------|------|------------------|
| **Mohamed Elfaki** | AI/ML Lead | Gpt 2 image integration,prompt engineering |
| **Firas Nazar** | Backend Lead | API development, database, cloud deployment |
| **Saad Ahmed** | Frontend Lead | React web application, UI/UX design |
| **Ahmed Salmi** | Mobile & Integration | React Native app, system integration |

**Supervisor:** Prof. Dr. Hakan Altinçay  
**Institution:** Eastern Mediterranean University  
**Course:** CMSE 405/CMSE 406
**Timeline:** October 2025 - June 2026

---

##  Quick Start

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-username/DeClutter-Capstone/Main-System
```

**2. Setup Python environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```


##  Running the Application

### Backend API
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# API runs on http://localhost:8000
```

### Frontend (Web)
```bash
cd frontend
npm install
npm run dev

# Web app runs on http://localhost:3000
```

### Database
```bash
Download and run PGadmin 4
```

---



### Sample Transformations

| Original | Minimalist | Modern | Scandinavian |
|----------|------------|--------|--------------|
| ![](docs/samples/Average-Bedroom-Sizes-in-American-Homes-Remodeling-and-Design-Tips-3.webp) | ![](docs/samples/bedroom_minimalist_23.jpg) | ![](docs/samples/bedroom_modern_10.jpg) | ![](docs/samples/bedroom_scandinavian_3.jpg) |




##  Technology Stack

### AI/ML
- OpenAI API

### Backend
- FastAPI
- PostgreSQL

### Frontend
- React
- React Native

### DevOps
- GitHub Actions (CI/CD)
- Docker

---

##  Documentation

- [Project Report](docs/CMSE405_PPM_.docx)
- [Final Presentation](docs/presentation.pptx)
- [API Documentation](docs/api.md)
- [User Guide](docs/user-guide.md)

---

##  Contributing

This is an academic project. For questions or collaboration:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

##  License

This project is for academic purposes as part of CMSE 405 coursework at Eastern Mediterranean University.

---

##  Acknowledgments

- **Supervisor:** Prof. Dr. Hakan Altunçay

---

## 📞 Contact

**Mohamed Elfaki** - Project Member  
📧 mohbusiness2400@gmail.com 
🔗 [LinkedIn](https://www.linkedin.com/in/mohamed-elfaki-1-/) | [GitHub](https://github.com/SyntaxNomad)


**Firas Abedlgadir** - Project Member  
📧 firasnazar@gmail.com 
🔗 [LinkedIn](https://www.linkedin.com/in/firas-abdelgadir-98322a247/) | [GitHub](https://github.com/firasnazar2004)

**Project Link:** [DeClutter](https://github.com/DeClutter-Capstone/Main-System)

**Last Updated:** May 2026
