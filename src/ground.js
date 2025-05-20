import {
    TextureLoader,
    PlaneGeometry,
    MeshBasicMaterial,
    Mesh,
    RepeatWrapping,
    DoubleSide,    
} from 'three';

import { config } from './config';

export default class Ground {
    constructor(scene, tileScale = 2) {
        this.scene = scene;
        this.tileScale = tileScale;
        this.groundMesh = null;
        this.groundMaterial = null;
        this.groundGeometry = null;
        this.texture = null;

        this.initGround();
    }

    initGround() {
        const textureLoader = new TextureLoader(); 

        textureLoader.load(
            '/models/rocky_terrain_02_1k/rocky_terrain_02_diff_1k.jpg',
            (texture) => {
                this.texture = texture;

                this.texture.wrapS = RepeatWrapping;
                this.texture.wrapT = RepeatWrapping;
                this.texture.repeat.set(this.tileScale, this.tileScale);

                this.groundMaterial = new MeshBasicMaterial({ map: this.texture, side: DoubleSide });
                this.groundGeometry = new PlaneGeometry(config.groundSize, config.groundSize, 1, 1);
                
                this.groundMesh = new Mesh(this.groundGeometry, this.groundMaterial);
                this.groundMesh.rotation.x = -Math.PI / 2; 
                this.scene.add(this.groundMesh);
            },
            undefined, 
            (error) => { 
                console.error('Error loading ground texture:', error);
            }
        );
    }

    dispose() {
        if (this.groundMesh) {
            this.scene.remove(this.groundMesh);
            
            if (this.groundGeometry) {
                this.groundGeometry.dispose();
                this.groundGeometry = null;
            }

            if (this.groundMaterial) {
                if (this.groundMaterial.map) {
                    this.groundMaterial.map.dispose();
                    this.groundMaterial.map = null;
                }
                this.groundMaterial.dispose();
                this.groundMaterial = null;
            }
            
            if (this.texture) {
                this.texture.dispose();
                this.texture = null;
            }

            this.groundMesh = null;
            console.log('Ground resources disposed.');
        } else {
            console.warn('Ground mesh not initialized or already disposed.');
        }
    }
}