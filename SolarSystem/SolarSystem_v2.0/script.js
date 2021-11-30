//Tentative de simulation d'orbit d'objet
//Hippolyte Roussel 16/10/21




const canvas = document.querySelector("canvas"); //selectionne la canvas dans la page html
canvas.width = window.innerWidth; //redefinit la tailel de la canvas
canvas.height = window.innerHeight;
const c = canvas.getContext("2d");

let unit = 0.7;
let speed = 10;

class Body {
    constructor(posX, posY, vecX, vecY, mass, radius, color) {
        this.posX = posX / unit; //position sur la canvas
        this.posY = posY / unit;

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

    update() { //modifie la position sur le canvas
        this.posX = this.posX + this.vecX; //position initial + le décalage indiqué en x et en y
        this.posY = this.posY + this.vecY;
    }

    interact(otherBody) { //détermine le nouveau vec basé sur l'interaction avec un autre corps

        let distance = Math.sqrt((otherBody.posX - this.posX) ** 2 + Math.abs(otherBody.posY - this.posY) ** 2); //calcul de la distance entre les 2 corps avec le theoreme de pythagore
        const G = 6; //constante gravitationelle 6.67408 * 10 ** (-11) ici la valeur est augmenter pour tester 
        let attractionForce = G * ((this.mass * otherBody.mass) / distance ** 2); //calcul de l'attraction entre les 2 corps (sans tenir compte des directions)
        //console.log(attractionForce);

        //reconstrucion des dimensions de cette force par rapport a la position des corps sur la canvas
        let angle = Math.acos((otherBody.posX - this.posX) / distance); //calcul de l'angle Alpha en radian entre le coté adjcant (axe X) et l'hypothenus (distance calculé juste avant)
        let newVecX = Math.cos(angle) * attractionForce; //calcul des nouveaux coté d'un triangle dont l'hypothenus de celui-ci serait attractionForce
        let newVecY = Math.sin(angle) * attractionForce;

        //mise a jour du vecteur
        this.vecX += newVecX / this.mass;


        //probablement parce que le triangle (conceptuel) utilisé pour calculer acos est inversé
        if (otherBody.posY < this.posY) {
            this.vecY -= newVecY / this.mass;
        } else {
            this.vecY += newVecY / this.mass;
        }

    }

    focus() { //mesure la distance qui sépare l'objet voulu du centre et décale tout les objets de cette distance
        let deplacementX = centerX - this.posX * unit;
        let deplacementY = centerY - this.posY * unit;

        bodies.forEach(body => {
            body.posX += deplacementX;
            body.posY += deplacementY;
        });
    }

    setVelocity(angle, magnitude) { // permet de donner un direction (angle en radian sans le pi) et une magnitude
        this.vecX = Math.cos(Math.PI * angle) * magnitude;
        this.vecY = Math.sin(Math.PI * -angle) * magnitude; //-angle car le repere trigo est different d'un repere canvas. Il inverser la hauteur puisque la canvas y pointe vers le bas
    }

    setRadiusProportional() { //modifie la longeueur du rayon pour que ce soit proportionel a la masse du corps
        this.radius = this.mass / 20;
    }
}





const centerX = window.innerWidth / 2;
const centerY = window.innerHeight / 2;

let bodies = [];

bodies.push(new Body(centerX * 0.5, centerY, 0, 0, 2000, 10, "orange"));
bodies.push(new Body(centerX * 0.3, centerY, 0, 0, 70, 10, "blue"));
bodies.push(new Body(centerX * 1.8, centerY, 0, 0, 100, 10, "black"));
bodies.push(new Body(centerX * 1.7, centerY, 0, 1, 10, 10, "green"));
bodies.push(new Body(centerX * 3, centerY * 4, 0, 0, 20, 10, "purple"));
bodies.push(new Body(centerX * -2, centerY * -2, 0, 0, 60, 10, "white"));

bodies[0].setVelocity(0, 0.01); //angle de 0 à 2 pour un tour complet (sans le pi)
bodies[1].setVelocity(1.5, 8);
bodies[2].setVelocity(0.5, 3.8);
bodies[3].setVelocity(0.5, 1);
bodies[4].setVelocity(0.91, 5);
bodies[5].setVelocity(1.6, 2);

bodies.forEach(body => {
    body.setRadiusProportional();
})

let focusNumber = -1

function animate() {
    setTimeout(function() {
        requestAnimationFrame(animate);
    }, 1);
    //c.clearRect(0, 0, canvas.width, canvas.height); // raffraichisment de la canvas

    if (focusNumber > -1) {
        bodies[focusNumber].focus();
    }
    let bodyIndexThatWillBeRemove;
    let needToSplice = false;
    for (let i = 0; i < bodies.length; i++) {
        for (let j = 0; j < bodies.length; j++) {
            if (bodies[i] != bodies[j]) {
                bodies[i].interact(bodies[j]);


                if (Math.abs(bodies[i].posX - bodies[j].posX) <= bodies[i].radius + bodies[j].radius && Math.abs(bodies[i].posY - bodies[j].posY) <= bodies[i].radius + bodies[j].radius) {
                    let biggest = null;
                    let smallest = null;
                    if (bodies[i].mass > bodies[j].mass) {
                        biggest = bodies[i];
                        smallest = bodies[j];
                        bodyIndexThatWillBeRemove = j;
                    } else {
                        biggest = bodies[j];
                        smallest = bodies[i];
                        bodyIndexThatWillBeRemove = i;

                    }
                    biggest.mass += smallest.mass;
                    needToSplice = true;

                }

            }




        }
    }
    for (let i = 0; i < bodies.length; i++) {
        bodies[i].update();
        bodies[i].draw();
    }
    if (needToSplice) {
        bodies.splice(bodyIndexThatWillBeRemove, 1);
    }

}

animate();

//setTimeout(function() {
//    location.reload();
//}, 100000);


window.addEventListener('keydown', (event) => {
    const keyName = event.key;

    if (keyName === 'q') {
        if (focusNumber == -1) {
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
            focusNumber = -1;
        } else {
            focusNumber++;
        }
        setTimeout(function() {
            c.clearRect(0, 0, canvas.width, canvas.height); // raffraichisment de la canvas
        }, 500);
        return;
    }


    if (keyName === 'z') {
        if (unit < 0.1) {
            unit = unit + 0.01;
        } else {
            unit = unit + 0.1;
        }

        setTimeout(function() {
            c.clearRect(0, 0, canvas.width, canvas.height); // raffraichisment de la canvas
        }, 500);
        return;
    }

    if (keyName === 's') {
        if (unit < 0.1) {
            unit = unit - 0.01;
        } else {
            unit = unit - 0.1;
        }


        setTimeout(function() {
            c.clearRect(0, 0, canvas.width, canvas.height); // raffraichisment de la canvas
        }, 500);
        return;
    }
});






/*
//TODO
systeme d'ajout en direct de corps




//test de collision
let biggest = null;
let smallest = null;
if (bodies[i].mass > bodies[j].mass) {
    biggest = bodies[i];
    smallest = bodies[j];
    bodyIndexThatWillBeRemove = j;
} else {
    biggest = bodies[j];
    smallest = bodies[i];
    
}






}

*/


/*
savePos() {
    this.posHisX.push(this.posX);
    this.posHisY.push(this.posY);
}

drawLine() {
    for (let i = 0; i < this.posHisX.length; i++) {
        
    }
}
*/