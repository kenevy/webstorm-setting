
function COWA3DModul(path, name) {
    this.path = path;
    this.name = name;
    
    // moduls.push([name, moduls.length])

    // var container, controls;
    var camera, scene, renderer, threeOnEvent;

    scene = new THREE.Scene();
    clock = new THREE.Clock();
    camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });

    // threeOnEvent = new THREE.onEvent(s, c);

    this.init = function (gscene, position, rotation, size) {
        container = document.getElementById('potree_render_area');
        //camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.set(0, 0, 0);
        scene.name = this.name;
        camera.name = 'cowa-camera'
        // collada
        var loader = new THREE.ColladaLoader();
        loader.load(this.path, function (collada) {
            var animations = collada_scene = collada.animations;
            var avatar = collada.scene;
            avatar.name = "cowa-scene-1"
            avatar.scale.x = avatar.scale.y = avatar.scale.z = size;

            avatar.position.set(position.x, position.y, position.z);
            avatar.rotation.set(rotation.x, rotation.y, rotation.z);
            avatar.traverse(function (node) {
                if (node.isSkinnedMesh) {
                    node.frustumCulled = false;
                }
            });

            scene.add(avatar);
        });

        var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        ambientLight.position.set(1000, 1000, -1000);
        scene.add(ambientLight);

        // var spotLight = new THREE.SpotLight(0xffffff, 0.1);
        // spotLight.position.set(1000, 1000, -1000);
        // scene.add(spotLight);

        //var pointLight = new THREE.PointLight(0xffffff, 0.1);
        //pointLight.intensity = 2.4;//光线强度
       // pointLight.position.set(10, 1000, -1000);
        //	camera.add(pointLight);

        scene.add(camera);
        // renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.name = 'renderer'
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);
        //
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.screenSpacePanning = true;
        controls.minDistance = 5;
        controls.maxDistance = 40;
        controls.target.set(0, 2, 0);
        controls.update();

        gscene.add(scene);


    }

    this.setposition = function (position, rotation) {

        s1 = scene.getObjectByName('cowa-scene-1')
        if (s1) {
            s1.rotation.set(rotation.x, rotation.y, rotation.z);
            s1.position.set(position.x, position.y, position.z)
        }
    }

}
