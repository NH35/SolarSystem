const canvas = document.querySelector("canvas"); //selectionne la canvas dans la page html
canvas.width = window.innerWidth; //redefinit la tailel de la canvas
canvas.height = window.innerHeight;
const c = canvas.getContext("2d");

const center = { x: canvas.width / 2, y: canvas.height / 2, z: 0 };
var timeStep = 1; //si on veux accelerer la simulation
let G = 1;

let LengthUnit = 0.1; //si on veut modifier le zoom de la simulation

class Body {
    constructor(pos, velocity, mass, radius, color) {
        this.pos = pos;
        this.velocity = velocity;
        this.mass = mass;
        this.radius = radius;
        this.color = color;

        this.acceleration = { x: 0, y: 0 };
    }


    draw(LengthUnit) {
        //cercle
        c.beginPath();
        c.arc(this.pos.x * LengthUnit + cameraPos.x, this.pos.y * LengthUnit + cameraPos.y, this.radius * LengthUnit, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }


    ///////////////////////////////////////////

    calculDistance(otherBody) { //calcul de la distance entre les 2 corps avec le theoreme de pythagore
        let distance = Math.sqrt((otherBody.pos.x - this.pos.x) ** 2 + Math.abs(otherBody.pos.y - this.pos.y) ** 2);
        return distance;
    }

    calculGlobalAttractionForce(otherBody) { //calcul la force d'attraction entre les 2 corps (cette force ne tiens pas compte des directions)
        let attractionForce = G * ((this.mass * otherBody.mass) / this.calculDistance(otherBody) ** 2);
        return attractionForce;
    }

    calculGlobalAttractionForceOptimiezd(otherBody) { //la meme chose qu'au dessus mais on évite une racine carré
        let distance = (otherBody.pos.x - this.pos.x) ** 2 + Math.abs(otherBody.pos.y - this.pos.y) ** 2;
        let attractionForce = G * ((this.mass * otherBody.mass) / distance);
        return attractionForce;
    }



    splitForceIntoXyAcceleration(otherBody) { //reconstrucion des dimensions de la force d'attraction selon la position des corps sur la canvas. 
        let attractionForce = this.calculGlobalAttractionForceOptimiezd(otherBody);

        let angle = Math.acos((otherBody.pos.x - this.pos.x) / this.calculDistance(otherBody)); //calcul de l'angle Alpha en radian entre le coté adjcant (axe X) et l'hypothenus (distance calculé juste avant)
        this.acceleration.x = Math.cos(angle) * attractionForce / this.mass; //calcul des nouveaux coté d'un triangle dont l'hypothenus de celui-ci serait attractionForce
        this.acceleration.y = Math.sin(angle) * attractionForce / this.mass;
    }

    updateSpeed(otherBody) { // vitesse = acceleration * temps
        this.velocity.x += this.acceleration.x * timeStep; //multiplication par le pas de temps désiré

        //probablement parce que le triangle (conceptuel) utilisé pour calculer acos est inversé
        if (otherBody.pos.y < this.pos.y) {
            this.velocity.y -= this.acceleration.y * timeStep;
        } else {
            this.velocity.y += this.acceleration.y * timeStep;
        }
    }



    interact(bodies) { //fonction qui calcul les effets au corps par rapport a tout les autres
        for (let i = 0; i < bodies.length; i++) {
            if (bodies[i] != this) {
                this.splitForceIntoXyAcceleration(bodies[i]);
                this.updateSpeed(bodies[i]);
            }
        }
    }

    updatePos() { //met a jour la position selon la velocité (vitesse) et le pas de temps (run for each body)
        this.pos.x += this.velocity.x * timeStep;
        this.pos.y += this.velocity.y * timeStep;
    }


    //////////////////// AUTRES FONCTIONS UTILES ///////////////////////

    setVelocity(angle, magnitude) { // permet de donner un direction (angle en radian sans le pi) et une magnitude au lieu d'un systeme XY
        this.velocity.x = Math.cos(Math.PI * angle) * magnitude;
        this.velocity.y = Math.sin(Math.PI * -angle) * magnitude; //-angle car le repere trigo est different d'un repere canvas. Il inverser la hauteur puisque la canvas y pointe vers le bas
    }

    setRadiusProportional(denominator) { //modifie la longeueur du rayon pour que ce soit proportionel a la masse du corps
        this.radius = this.mass / denominator;
    }

    move(movement) {
        this.pos.x += movement.x;
        this.pos.y += movement.y;
    }
}






function moveAll(movement) {
    cameraPos.x += movement.x;
    cameraPos.y += movement.y;

    c.clearRect(0, 0, canvas.width, canvas.height);
}

function zoom(scaleFactor) {
    //c.scale(scaleFactor, scaleFactor);
    LengthUnit *= scaleFactor;

    let movement = { x: center.x - center.x * scaleFactor, y: center.y - center.y * scaleFactor }
    moveAll(movement);

    c.clearRect(0, 0, canvas.width, canvas.height);
}











let cameraPos = { x: center.x, y: center.y, z: 0 };

let bodies = [];

bodies.push(new Body({ x: center.x + center.x * 0.5, y: center.y + center.y * 0 }, { x: 0, y: 0 }, 2000, 100, "orange"));
bodies.push(new Body({ x: center.x + center.x * 0.3, y: center.y + center.y * 0 }, { x: 0, y: 0 }, 70, 100, "cyan"));
bodies.push(new Body({ x: center.x + center.x * 1.8, y: center.y + center.y * 0 }, { x: 0, y: 0 }, 100, 100, "white"));
bodies.push(new Body({ x: center.x + center.x * 1.7, y: center.y + center.y * 0 }, { x: 0, y: 0 }, 10, 100, "lime"));
bodies.push(new Body({ x: center.x + center.x * 3.0, y: center.y + center.y * 4 }, { x: 0, y: 0 }, 20, 100, "purple"));

bodies[0].setVelocity(0.5, 0.1); //angle de 0 à 2 pour un tour complet (sans le pi)
bodies[1].setVelocity(1.5, 4);
bodies[2].setVelocity(0.5, 1.5);
bodies[3].setVelocity(0.5, 1);
bodies[4].setVelocity(0.91, 5);

bodies.forEach(body => {
    body.setRadiusProportional(50);
})

moveAll({ x: -400, y: -100 });

let delay = 0;
let cleaning = false;

function animate() {

    bodies.forEach(body => { //on update chaque corps
        body.interact(bodies);

    });

    if (cleaning) {
        c.clearRect(0, 0, canvas.width, canvas.height);
    }

    bodies.forEach(body => { //on affiche leur nouvelle position
        body.updatePos();
        body.draw(LengthUnit);
    });


    setTimeout(function() {
        requestAnimationFrame(animate);
    }, delay);
}

animate();






window.addEventListener('keydown', (event) => {
    const keyName = event.key;

    if (keyName === 'c') {

        if (cleaning) {
            cleaning = false;
        } else {
            cleaning = true;
        }


        c.clearRect(0, 0, canvas.width, canvas.height); // raffraichisment de la canvas

        return;
    }


    if (keyName === 'd') {

        moveAll({ x: -50, y: 0 });

        setTimeout(function() {
            c.clearRect(0, 0, canvas.width, canvas.height); // raffraichisment de la canvas
        }, 500);
        return;
    }
    if (keyName === 'q') {

        moveAll({ x: 50, y: 0 });

        setTimeout(function() {
            c.clearRect(0, 0, canvas.width, canvas.height); // raffraichisment de la canvas
        }, 500);
        return;
    }


    if (keyName === 's') {

        moveAll({ x: 0, y: -50 });


        setTimeout(function() {
            c.clearRect(0, 0, canvas.width, canvas.height); // raffraichisment de la canvas
        }, 500);
        return;
    }

    if (keyName === 'z') {

        moveAll({ x: 0, y: 50 });

        setTimeout(function() {
            c.clearRect(0, 0, canvas.width, canvas.height); // raffraichisment de la canvas
        }, 500);
        return;
    }
});