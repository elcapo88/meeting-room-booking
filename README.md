# 📅 Meeting Room Booking System (Libre & Open Source)

Un système complet, moderne et **100 % gratuit et libre** pour gérer les réservations de salles de réunion dans les entreprises, écoles, universités et associations. 

Ce projet est basé sur l'architecture formelle d'analyse et conception orientée objet (**OOAD**) publiée par **Objective Engineering, Inc. (Oeng)** / *Charles Richter*.

---

## 🌟 Fonctionnalités

- **Interface Web & Mobile Moderne (PWA)** : Interface responsive utilisable sur ordinateur et installable en un clic sur smartphone Android et iOS (sans passer par les stores).
- **Allocation Optimale de Salles** : L'algorithme (`RoomPool`) sélectionne automatiquement la plus petite salle disponible capable d'accueillir tous les participants.
- **Gestion des Réunions & Participants** : Définition des réunions, ajout et suppression de participants avec règles de gestion automatisées.
- **Règles Métier en Cascade** :
  - Annulation automatique d'une réunion si tous les participants sont retirés.
  - Libération immédiate des créneaux de salle en cas d'annulation.
  - Notification automatique par e-mail (`PostOffice`) lors de chaque invitation ou annulation.
- **Prêt pour Docker** : Déploiement en une seule commande pour les administrateurs système et équipes IT.
- **API REST Complète** : Propulsée par **FastAPI** avec documentation interactive Swagger intégrée (`/docs`).

---

## 🚀 Démarrage Rapide

### Option 1 : Avec Docker (Recommandé)

Aucune installation de Python requise. Tapez simplement dans votre terminal :

```bash
docker compose up -d
```

Ouvrez ensuite votre navigateur sur `http://localhost:8000` !

Pour arrêter le service :
```bash
docker compose down
```

---

### Option 2 : Installation Locale avec Python

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/elcapo88/meeting-room-booking.git
   cd meeting-room-booking
   ```

2. **Installer les dépendances** :
   ```bash
   pip install -r requirements.txt
   ```

3. **Lancer le serveur d'application** :
   ```bash
   PYTHONPATH=src uvicorn meeting_room_booking.web.app:app --host 0.0.0.0 --port 8000 --reload
   ```

4. Accédez à l'application sur `http://localhost:8000`.
   * La documentation interactive de l'API est accessible sur `http://localhost:8000/docs`.

---

## 📱 Utilisation sur Mobile (Application PWA)

L'application intègre le support natif **PWA (Progressive Web App)** :
1. Ouvrez l'adresse de votre serveur sur le navigateur de votre smartphone (ex: Chrome ou Safari).
2. Cliquez sur la bannière **« Installer l'application »** ou choisissez **« Ajouter à l'écran d'accueil »** dans le menu de votre navigateur.
3. L'application apparaît avec son icône sur votre écran d'accueil et s'exécute en plein écran comme une application native !

---

## 🏗️ Architecture OOAD (Design Model)

```
meeting-room-booking/
├── src/
│   └── meeting_room_booking/
│       ├── domain/                  # Entités du domaine métier
│       │   ├── room.py              # Room, RoomAssignment, RoomPool (Singleton)
│       │   ├── meeting.py           # Meeting, ScheduledMeeting
│       │   └── exceptions.py        # Exceptions métier
│       ├── facades/                 # Façades d'administration et d'ordonnancement
│       │   ├── administration.py    # MeetingAdministration (Singleton)
│       │   └── scheduler.py         # FacilitiesScheduler (Singleton)
│       ├── external/                # Adaptateurs externes
│       │   ├── employee_management.py # Annuaire employés
│       │   └── post_office.py       # Envoi des e-mails et notifications
│       └── web/                     # Application Web & API REST
│           ├── app.py               # Routes FastAPI
│           └── static/              # Interface Web, PWA Manifest, Service Worker
├── tests/                           # Suite de tests unitaires complète
├── Dockerfile                       # Conteneur Docker léger
├── docker-compose.yml               # Déploiement multi-services
└── requirements.txt                 # Dépendances Python
```

---

## 🧪 Exécution des Tests Unitaires

Le projet inclut une suite de tests unitaires automatisée validant toutes les règles de réservation et de notification :

```bash
PYTHONPATH=src python3 -m unittest discover -s tests
```

---

## 📄 Licence

Ce projet est distribué sous la Licence MIT. Vous êtes libre de l'utiliser, le modifier, l'héberger et le redistribuer gratuitement pour vos besoins personnels ou en entreprise.
