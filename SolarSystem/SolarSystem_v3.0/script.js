//Simulation d'orbit
//Hippolyte Roussel 19/10/21

const canvas = document.querySelector("canvas"); //selectionne la canvas dans la page html
canvas.width = window.innerWidth; //redefinit la taille de la canvas
canvas.height = window.innerHeight;
const c = canvas.getContext("2d");

var lengthUnit = 1; //si on veut modifier le zoom de la simulation
var timeStep = 5; //si on veux accelerer la simulation
const G = 6;


class Body {
    constructor(posX, posY, velocityX, velocityY, mass, radius, color) {
        this.posX = posX; //position sur la canvas
        this.posY = posY;

        this.velocityX = velocityX; //force de mouvement. indiqué par le nombre de pixel a déplacer en width et en height
        this.velocityY = velocityY;
        this.accelerationX;
        this.accelerationY;

        this.mass = mass; //masse du corps pour calculer l'attraction 

        this.radius = radius; //taille de la sphere
        this.color = color; //couleur de la sphere
    }

    draw() {
        //cercle
        c.beginPath();
        c.arc(this.posX * lengthUnit, this.posY * lengthUnit, this.radius * lengthUnit, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }


    ///////////////////////////////////////////

    calculDistance(otherBody) { //calcul de la distance entre les 2 corps avec le theoreme de pythagore
        let distance = Math.sqrt((otherBody.posX - this.posX) ** 2 + Math.abs(otherBody.posY - this.posY) ** 2);
        return distance;
    }

    calculGlobalAttractionForce(otherBody) { //calcul la force d'attraction entre les 2 corps (cette force ne tiens pas compte des directions)
        let attractionForce = G * ((this.mass * otherBody.mass) / this.calculDistance(otherBody) ** 2);
        return attractionForce;
    }

    calculGlobalAttractionForceOptimiezd(otherBody) { //la meme chose qu'au dessus mais on évite une racine carré
        let distance = (otherBody.posX - this.posX) ** 2 + Math.abs(otherBody.posY - this.posY) ** 2;
        let attractionForce = G * ((this.mass * otherBody.mass) / distance);
        return attractionForce;
    }

    splitForceIntoXyAcceleration(otherBody) { //reconstrucion des dimensions de la force d'attraction selon la position des corps sur la canvas. 
        let attractionForce = this.calculGlobalAttractionForceOptimiezd(otherBody);

        let angle = Math.acos((otherBody.posX - this.posX) / this.calculDistance(otherBody)); //calcul de l'angle Alpha en radian entre le coté adjcant (axe X) et l'hypothenus (distance calculé juste avant)
        this.accelerationX = Math.cos(angle) * attractionForce / this.mass; //calcul des nouveaux coté d'un triangle dont l'hypothenus de celui-ci serait attractionForce
        this.accelerationY = Math.sin(angle) * attractionForce / this.mass;
    }

    updateSpeed(otherBody) { // vitesse = acceleration * temps
        this.velocityX += this.accelerationX * timeStep; //multiplication par le pas de temps désiré

        //probablement parce que le triangle (conceptuel) utilisé pour calculer acos est inversé
        if (otherBody.posY < this.posY) {
            this.velocityY -= this.accelerationY * timeStep;
        } else {
            this.velocityY += this.accelerationY * timeStep;
        }
    }



    interact(otherBody) { //the fonction to run for each body for each body
        this.splitForceIntoXyAcceleration(otherBody);
        this.updateSpeed(otherBody);
    }

    updatePos() { //met a jour la position selon la velocité (vitesse) et le pas de temps (run for each body)
        this.posX += this.velocityX * timeStep;
        this.posY += this.velocityY * timeStep;
    }

    ///////////////////////////////////////////

    setVelocity(angle, magnitude) { // permet de donner un direction (angle en radian sans le pi) et une magnitude au lieu d'un systeme XY
        this.velocityX = Math.cos(Math.PI * angle) * magnitude;
        this.velocityY = Math.sin(Math.PI * -angle) * magnitude; //-angle car le repere trigo est different d'un repere canvas. Il inverser la hauteur puisque la canvas y pointe vers le bas
    }

    setRadiusProportional(denominator) { //modifie la longeueur du rayon pour que ce soit proportionel a la masse du corps
        this.radius = this.mass / denominator;
    }

    move(movingX, movingY) {
        this.posX += movingX;
        this.posY += movingY;
    }


}

const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;

function focus(body) { //mesure la distance qui sépare l'objet voulu du centre et décale tout les objets de cette distance
    let movingX = centerX - body.posX * lengthUnit;
    let movingY = centerY - body.posY * lengthUnit;

    bodies.forEach(body => {
        body.posX += movingX;
        body.posY += movingY;
    });
}




let bodies = [];

bodies.push(new Body(centerX * 0.5, centerY, 0, 0, 2000, 10, "orange"));
bodies.push(new Body(centerX * 0.3, centerY, 0, 0, 70, 10, "cyan"));
bodies.push(new Body(centerX * 1.8, centerY, 0, 0, 100, 10, "yellow"));
bodies.push(new Body(centerX * 1.7, centerY, 0, 1, 10, 10, "limegreen"));
//bodies.push(new Body(centerX * 3, centerY * 4, 0, 0, 20, 10, "purple"));
bodies.push(new Body(centerX * -4, centerY, 0, 0, 300, 10, "red"));

bodies[0].setVelocity(0, 0.01); //angle de 0 à 2 pour un tour complet (sans le pi)
bodies[1].setVelocity(1.5, 0.1);
bodies[2].setVelocity(0.5, 4.2);
bodies[3].setVelocity(0.5, 0.80);
//bodies[4].setVelocity(0.91, 5);
bodies[4].setVelocity(1.5, 2.7);

bodies.forEach(body => {
    body.setRadiusProportional(30);
})

/*
bodies.forEach(body => {
    body.posX = body.posX / lengthUnit;
    body.posY = body.posY / lengthUnit;
});
*/



let focusNumber = 0;
let delay = 1;
lengthUnit = 0.4
setTimeout(function() {
    c.clearRect(0, 0, canvas.width, canvas.height); // raffraichisment de la canvas
}, 100);

function animate() {
    setTimeout(function() {
        requestAnimationFrame(animate);
    }, delay);


    for (let i = 0; i < bodies.length; i++) {
        for (let j = 0; j < bodies.length; j++) {
            if (bodies[i] != bodies[j]) {
                bodies[i].interact(bodies[j]);
            }
        }
    }
    for (let i = 0; i < bodies.length; i++) {
        if (focusNumber > -1) {
            focus(bodies[focusNumber]);
        }
        bodies[i].updatePos();
        bodies[i].draw();
    }

}

animate();













window.addEventListener('keydown', (event) => {
    const keyName = event.key;

    if (keyName === 'q') {
        if (focusNumber == 0) {
            focusNumber = bodies.length - 1;
        } else {
            focusNumber--;
        }
        setTimeout(function() {
            c.clearRect(0, 0, canvas.width, canvas.height); // raffraichisment de la canvas
        }, 500);
        return;
    }
    if (keyName === 'd') {
        if (focusNumber == bodies.length - 1) {
            focusNumber = 0;
        } else {
            focusNumber++;
        }
        setTimeout(function() {
            c.clearRect(0, 0, canvas.width, canvas.height); // raffraichisment de la canvas
        }, 500);
        return;
    }


    if (keyName === 'z') {

        lengthUnit = lengthUnit * 2;


        setTimeout(function() {
            c.clearRect(0, 0, canvas.width, canvas.height); // raffraichisment de la canvas
        }, 500);
        return;
    }

    if (keyName === 's') {
        lengthUnit = lengthUnit / 2;



        setTimeout(function() {
            c.clearRect(0, 0, canvas.width, canvas.height); // raffraichisment de la canvas
        }, 500);
        return;
    }
});


/*
TODO
faire en sorte que les corps soit correcte en fonction de la taille de la fenetre

*/