let angle;

const sketch = (p5) => {
    p5.setup = () => {
        let canvas = p5.createCanvas(200, 200); // Reduced canvas size from 400x400 to 200x200
        canvas.parent('fractal-tree');
        p5.background(0, 0); // Transparent background
        angle = p5.PI / 4;
        p5.stroke(255); // White stroke for branches
    }

    p5.draw = () => {
        p5.clear();
        p5.translate(100, p5.height); // Adjusted translation for the smaller canvas (200/2 = 100)
        angle = p5.map(p5.sin(p5.frameCount * 0.01), -1, 1, p5.PI / 2, p5.PI / 16);
        branch(50); // Reduced initial branch length from 100 to 50
    }

    const branch = (len) => {
        p5.line(0, 0, 0, -len);
        p5.translate(0, -len);
        if (len > 2) { // Reduced minimum branch length from 4 to 2
            p5.push();
            p5.rotate(angle);
            branch(len * 0.67);
            p5.pop();
            p5.push();
            p5.rotate(-angle);
            branch(len * 0.67);
            p5.pop();
        }
    }
};

new p5(sketch);