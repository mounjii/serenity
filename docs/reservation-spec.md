Tu travailles sur un site web de réservation pour un salon de massage.

Le frontend utilise **React**. Avant de modifier quoi que ce soit, analyse attentivement le projet existant : structure, composants, routing, styles, API, base de données et architecture actuelle. **Ne réécris pas le projet et ne remplace pas les technologies existantes inutilement.** Intègre la fonctionnalité dans l'architecture actuelle.

## Objectif

Créer un système complet de réservation avec :

1. Une interface publique permettant au client de réserver.
2. Une réservation enregistrée dans la base de données.
3. Un dashboard administrateur pour le propriétaire.
4. Une mise à jour en temps réel du dashboard lorsqu'une nouvelle réservation est créée.
5. Une notification WhatsApp au client.
6. Une notification WhatsApp au propriétaire.
7. Le client est le seul à confirmer la réservation. Le propriétaire reçoit uniquement une notification et n'a pas besoin de confirmer.

---

## 1. Réservation côté client

Créer/adapter la page de réservation React.

Le client doit pouvoir sélectionner :

* Service / type de massage
* Date
* Heure disponible
* Nom
* Numéro de téléphone
* Éventuellement une note/commentaire

Avant de confirmer, afficher un récapitulatif :

* Service
* Date
* Heure
* Nom
* Téléphone
* Prix si disponible

Puis bouton :

**« Confirmer la réservation »**

Après confirmation :

* créer la réservation dans la base de données ;
* empêcher les doubles réservations du même créneau ;
* afficher une confirmation claire au client.

---

## 2. Statut de réservation

Une nouvelle réservation doit avoir automatiquement le statut :

**CONFIRMED**

Le propriétaire ne doit PAS avoir besoin de confirmer la réservation.

Prévoir éventuellement les statuts :

* CONFIRMED
* COMPLETED
* CANCELLED

---

## 3. Dashboard administrateur

Créer une interface `/admin` protégée par authentification.

Le dashboard doit afficher :

### Aujourd'hui

* Nombre de réservations
* Liste des réservations
* Heure
* Nom du client
* Numéro de téléphone
* Service
* Statut

### Réservations à venir

Permettre de filtrer par :

* Aujourd'hui
* Demain
* Cette semaine
* Date personnalisée

Permettre au propriétaire de :

* consulter une réservation ;
* annuler une réservation ;
* marquer une réservation comme terminée ;
* éventuellement créer manuellement une réservation.

Le dashboard doit être simple, propre et professionnel.

---

## 4. Temps réel

Lorsqu'un client crée une réservation :

Client → Backend → Database → Dashboard admin

Le dashboard doit recevoir la nouvelle réservation **en temps réel**, sans que le propriétaire ait besoin de rafraîchir la page.

Utiliser la technologie temps réel déjà présente dans le projet si elle existe.

Sinon, utiliser **WebSocket ou Server-Sent Events**, selon ce qui correspond le mieux à l'architecture actuelle.

---

## 5. Disponibilité des créneaux

Le système doit afficher uniquement les créneaux disponibles.

Lorsqu'un créneau est réservé :

15:00 AVAILABLE → Client confirme → 15:00 CONFIRMED

Il doit immédiatement devenir indisponible pour les autres clients.

IMPORTANT :

La protection contre les doubles réservations doit être faite **côté backend et base de données**, et pas uniquement côté React.

Deux clients qui essaient de réserver simultanément le même créneau ne doivent jamais pouvoir créer deux réservations valides.

Utiliser une transaction / contrainte appropriée selon la base de données utilisée.

---

## 6. WhatsApp

Après une réservation réussie, préparer l'intégration WhatsApp.

Le client doit recevoir :

> Votre réservation est confirmée.
>
> Service : [service]
> Date : [date]
> Heure : [heure]
>
> Merci pour votre réservation.

Le propriétaire doit recevoir :

> Nouvelle réservation !
>
> Client : [nom]
> Téléphone : [téléphone]
> Service : [service]
> Date : [date]
> Heure : [heure]

IMPORTANT :

Ne pas implémenter une automatisation WhatsApp personnelle fragile.

Utiliser une architecture compatible avec une **API WhatsApp Business / fournisseur WhatsApp officiel**.

Les credentials WhatsApp doivent rester côté backend dans des variables d'environnement.

Ne jamais exposer les tokens/API keys dans React.

Si aucune API WhatsApp n'est actuellement configurée dans le projet, créer un service abstrait du type :

`WhatsAppNotificationService`

afin que l'intégration puisse être ajoutée facilement plus tard.

En développement, prévoir éventuellement un mode mock/log permettant de tester les notifications sans envoyer de vrais messages.

---

## 7. Sécurité

Respecter les bonnes pratiques :

* validation des données côté frontend ET backend ;
* validation du numéro de téléphone ;
* authentification du dashboard admin ;
* autorisation côté backend ;
* ne jamais faire confiance aux données envoyées par React ;
* protéger les endpoints administrateur ;
* ne jamais exposer les secrets/API keys au frontend ;
* protection contre les doubles réservations ;
* gérer correctement les erreurs.

---

## 8. API

Si le backend existe déjà, réutiliser son architecture.

Créer ou adapter des endpoints similaires à :

POST   /api/reservations
GET    /api/reservations
GET    /api/reservations/{id}
PATCH  /api/reservations/{id}/cancel
PATCH  /api/reservations/{id}/complete
GET    /api/availability

Adapter les noms et conventions à celles déjà utilisées dans le projet.

---

## 9. Base de données

Une réservation doit au minimum contenir :

id, clientName, phoneNumber, service, date, startTime, endTime, status, createdAt, updatedAt

Adapter les noms/types à la base de données existante.

Ajouter les index/contraintes nécessaires pour empêcher les conflits de réservation.

---

## 10. UX

Le site doit être :

* responsive ;
* simple ;
* rapide ;
* professionnel ;
* adapté au mobile ;
* cohérent avec le design existant.

Ne crée pas une interface administrative énorme.

Le propriétaire doit pouvoir comprendre les réservations en quelques secondes.

---

## IMPORTANT — Méthode de travail

Avant de coder :

1. Inspecte le projet existant.
2. Identifie le frontend React.
3. Identifie le backend.
4. Identifie la base de données.
5. Identifie le système d'authentification existant.
6. Identifie comment les services et horaires sont actuellement stockés.
7. Identifie les composants/routing existants que tu peux réutiliser.

Ensuite :

1. Explique brièvement l'architecture que tu proposes.
2. Liste les fichiers que tu vas modifier/créer.
3. Implémente la fonctionnalité progressivement.
4. Ne casse aucune fonctionnalité existante.
5. Réutilise les composants et styles existants lorsque c'est possible.
6. Vérifie les erreurs frontend/backend.
7. Vérifie les cas limites, notamment deux clients réservant simultanément le même créneau.

Ne fais pas de suppositions sur une technologie qui existe déjà : **inspecte d'abord le projet et adapte-toi à son architecture.**
