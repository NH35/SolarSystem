//Simulation d'orbit
//Hippolyte Roussel 19/10/21

const canvas = document.querySelector("canvas"); //selectionne la canvas dans la page html
canvas.width = window.innerWidth; //redefinit la taille de la canvas
canvas.height = window.innerHeight;
const c = canvas.getContext("2d");

let unit = 0.3;

class Body {
    constructor(posX, posY, vecX, vecY, mass, radius, color) {
        this.posX = posX; //position sur la canvas
        this.posY = posY;

        this.vecX = vecX; //force de mouvement. indiqué par le nombre de pixel a déplacer en width et en height
        this.vecY = vecY;

        this.mass = mass; //masse du corps pour calculer l'attraction 

        this.radius = radius; //taille de la sphere
        this.color = color; //couleur de la sphere
    }

    draw() {
        //cercle
        c.beginPath();
        c.arc(this.posX * unit, this.posY * unit, this.radius * unit, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }