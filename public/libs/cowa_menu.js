function setDescription(text) {
    let section = $(`
				<h3 id="menu_description" class="accordion-header ui-widget"><span>Description</span></h3>
				<div class="accordion-content ui-widget pv-menu-list"></div>
			`);
    let content = section.last();
    content.html(`
			<div class="pv-menu-list">
				${text}
			</div>
			`);
    //section.first().click(() => content.slideToggle());
    section.insertBefore($('#menu_appearance'));
}
function Menu() {
    this.addMenu = function (parent, text, id, object) {
        createNode(parent, text, id, object);
    }
    let section = $(`
				<h3 id="menu_meta" class="accordion-header ui-widget"><span>COWA</span></h3>
                <div class="accordion-content ui-widget pv-menu-list"></div>
                
                
			`);
    let content = section.last();
    content.html(`
            <div class="pv-menu-list">
            <div id="scene_objects"></div>
			`);
    section.first().click(() => content.slideToggle());
    section.insertBefore($('#menu_appearance'));

    let elScene = $("#menu_meta");
    let elObjects = elScene.next().find("#scene_objects");

    let tree = $(`<div id="jstree_scene"></div>`);
    elObjects.append(tree);
    //tree.append($('<ul role="grup" class="jstree-children>'))

    tree.jstree({
        'plugins': ["checkbox", "state"],
        'core': {
            "dblclick_toggle": false,
            "state": {
                "checked": true
            },
            'check_callback': true,
            "expand_selected_onload": true
        },
        "checkbox": {
            "keep_selected_style": true,
            "three_state": false,
            "whole_node": false,
            "tie_selection": false,
        },
    });

    let createNode = (parent, text, id, object) => {
        let nodeID = tree.jstree('create_node', parent, {
            "text": text,
            // "icon": icon,
            "id": id,
            "data": object
        },
            "last", false, false);

        if (object.visible) {
            tree.jstree('check_node', nodeID);
        } else {
            tree.jstree('uncheck_node', nodeID);
        }

        return nodeID;
    }

    let AutoID = tree.jstree('create_node', "#", { "text": "<b>view lock</b>", "id": "Auto", "data": 'auto' }, "last", false, false);
    let ColorTypeID = tree.jstree('create_node', "#", { "text": "<b>ColorType</b>", "id": "ColorType" }, "last", false, false);
    //let stopLineID = tree.jstree('create_node', "#", { "text": "<b>stopLine</b>", "id": "stopLine" }, "last", false, false);
    let GradientsID = tree.jstree('create_node', "#", { "text": "<b>Gradients</b>", "id": "GradientsID" }, "last", false, false);
    let CarListID = tree.jstree('create_node', "#", { "text": "<b>CarList</b>", "id": "CarListID" }, "last", false, false);
    g_carlistID = CarListID;

    tree.jstree("check_node", ColorTypeID);
    tree.jstree("check_node", GradientsID);
    // tree.jstree("check_node", stopLineID);
    tree.jstree("check_node", AutoID);

    //ColorType
    createNode(ColorTypeID, "HEIGHT", "HEIGHT", "HEIGHT");
    createNode(ColorTypeID, "INTENSITY", "INTENSITY", "INTENSITY");
    //Gradients
    createNode(GradientsID, "RAINBOW", "RAINBOW", "RAINBOW");
    createNode(GradientsID, "SPECTRAL", "SPECTRAL", "SPECTRAL");
    createNode(GradientsID, "PLASMA", "PLASMA", "PLASMA");
    createNode(GradientsID, "YELLOW_GREEN", "YELLOW_GREEN", "YELLOW_GREEN");
    createNode(GradientsID, "VIRIDIS", "VIRIDIS", "VIRIDIS");
    createNode(GradientsID, "INFERNO", "INFERNO", "INFERNO");

    tree.on('create_node.jstree', function (e, data) {
        tree.jstree("open_all");
    });

    tree.on("select_node.jstree", function (e, data) {
        let object = data.node.data;
        propertiesPanel.set(object);

        viewer.inputHandler.deselectAll();

        if (object instanceof Potree.Volume) {
            viewer.inputHandler.toggleSelection(object);
        }

        $(viewer.renderer.domElement).focus();
    });

    tree.on("uncheck_node.jstree", function (e, data) {
        let object = data.node;
        if (object.id == 'Auto') {
            auto_fllow = false
        } else if (object.id == 'waitLine') {
            let len = viewer.scene.scene.children.length;
            let arry = viewer.scene.scene.children;
            for (let i = 0; i < len; i++) {
                if (arry[i].name == 'waitLine') {
                    arry[i].visible = false;
                }
            }
        } else if (object.id == 'stopLine') {
            let len = viewer.scene.scene.children.length;
            let arry = viewer.scene.scene.children;
            for (let i = 0; i < len; i++) {
                if (arry[i].name == 'stopLine') {
                    arry[i].visible = false;
                }
            }

        } else {
            // let elScene = $("#jstree_scene");
            //console.log(elScene)
            // for (let i = 0; i < moduls.length; i++)
            //     if (moduls[i][1] != object.id) {
            //         console.log(object)

            //     }
        }
    });

    tree.on("check_node.jstree", function (e, data) {
        let object = data.node;
        if (object.id == 'Auto') {
            auto_fllow = true
        } else if (object.id == 'waitLine') {
            let len = viewer.scene.scene.children.length;
            let arry = viewer.scene.scene.children;
            for (let i = 0; i < len; i++) {
                if (arry[i].name == 'waitLine') {
                    arry[i].visible = true;
                }
            }
        } else if (object.id == 'stopLine') {
            let len = viewer.scene.scene.children.length;
            let arry = viewer.scene.scene.children;
            for (let i = 0; i < len; i++) {
                if (arry[i].name == 'stopLine') {
                    arry[i].visible = true;
                }
            }
        } else if (object.parent == 'ColorType') {
            if (object.id == 'HEIGHT') {

                g_material.pointColorType = Potree.PointColorType.HEIGHT;
            } else if (object.id == 'INTENSITY') {
                g_material.pointColorType = Potree.PointColorType.INTENSITY;
            }
            var ref = $('#jstree_scene').jstree(true);
            var nodes = ref.get_checked();  //使用get_checked方法
            let obj_p = document.getElementById(object.id).parentNode;

            $.each(nodes, function (i, nd) {
                if (nd != null && nd != object.id && document.getElementById(nd).parentNode == obj_p) {
                    ref.uncheck_node(nd);
                }

            });
        } else if (object.parent == 'GradientsID') {
            if (object.id == 'RAINBOW') {
                g_material.gradient = Potree.Gradients["RAINBOW"];
            } else if (object.id == 'SPECTRAL') {
                g_material.gradient = Potree.Gradients["SPECTRAL"];
            } else if (object.id == 'PLASMA') {
                g_material.gradient = Potree.Gradients["PLASMA"];
            } else if (object.id == 'YELLOW_GREEN') {
                g_material.gradient = Potree.Gradients["YELLOW_GREEN"];
            } else if (object.id == 'VIRIDIS') {
                g_material.gradient = Potree.Gradients["VIRIDIS"];
            } else if (object.id == 'INFERNO') {
                g_material.gradient = Potree.Gradients["INFERNO"];
            }
            var ref = $('#jstree_scene').jstree(true);
            var nodes = ref.get_checked();  //使用get_checked方法
            let obj_p = document.getElementById(object.id).parentNode;

            $.each(nodes, function (i, nd) {
                if (nd != null && nd != object.id && document.getElementById(nd).parentNode == obj_p) {
                    ref.uncheck_node(nd);
                }

            });
        } else if (object.parent == 'CarListID') {
            g_modul = viewer.scene.scene.getObjectByName(object.text);;
            // viewer.scene.view.position.set(g_modul.position.x+100, g_modul.position.y+100, g_modul.position.z);
            //viewer.scene.view.lookAt(pos);

            var ref = $('#jstree_scene').jstree(true);
            var nodes = ref.get_checked();  //使用get_checked方法

            let obj_p = document.getElementById(object.id).parentNode;

            $.each(nodes, function (i, nd) {
                if (nd != null && nd != object.id && document.getElementById(nd).parentNode == obj_p) {
                    ref.uncheck_node(nd);
                }

            });
            // $.each(nodes, function (i, nd) {
            //     if (nd != object.id) {
            //         if (nd != 'Auto')
            //             ref.uncheck_node(nd);

            //     }
            // });
        }


    });


    tree.on("deselect_node.jstree", function (e, data) {
        propertiesPanel.set(null);
    });

    // tree.on("delete_node.jstree", function (e, data) {
    //     propertiesPanel.set(null);
    // });

    // tree.on('dblclick', '.jstree-anchor', function (e) {
    //     let instance = $.jstree.reference(this);
    //     let node = instance.get_node(this);
    //     let object = node.data;

    //     // ignore double click on checkbox
    //     if (e.target.classList.contains("jstree-checkbox")) {
    //         return;
    //     }

    //     if (object instanceof Potree.PointCloudTree) {
    //         let box = viewer.getBoundingBox([object]);
    //         let node = new THREE.Object3D();
    //         node.boundingBox = box;
    //         viewer.zoomTo(node, 1, 500);
    //     } else if (object instanceof Potree.Measure) {
    //         let points = object.points.map(p => p.position);
    //         let box = new THREE.Box3().setFromPoints(points);
    //         if (box.getSize().length() > 0) {
    //             let node = new THREE.Object3D();
    //             node.boundingBox = box;
    //             viewer.zoomTo(node, 2, 500);
    //         }
    //     } else if (object instanceof Potree.Profile) {
    //         let points = object.points;
    //         let box = new THREE.Box3().setFromPoints(points);
    //         if (box.getSize().length() > 0) {
    //             let node = new THREE.Object3D();
    //             node.boundingBox = box;
    //             viewer.zoomTo(node, 1, 500);
    //         }
    //     } else if (object instanceof Potree.Volume) {

    //         let box = object.boundingBox.clone().applyMatrix4(object.matrixWorld);

    //         if (box.getSize().length() > 0) {
    //             let node = new THREE.Object3D();
    //             node.boundingBox = box;
    //             viewer.zoomTo(node, 1, 500);
    //         }
    //     } else if (object instanceof Potree.Annotation) {
    //         object.moveHere(viewer.scene.getActiveCamera());
    //     } else if (object instanceof Potree.PolygonClipVolume) {
    //         let dir = object.camera.getWorldDirection();
    //         let target;

    //         if (object.camera instanceof THREE.OrthographicCamera) {
    //             dir.multiplyScalar(object.camera.right)
    //             target = new THREE.Vector3().addVectors(object.camera.position, dir);
    //             viewer.setCameraMode(Potree.CameraMode.ORTHOGRAPHIC);
    //         } else if (object.camera instanceof THREE.PerspectiveCamera) {
    //             dir.multiplyScalar(viewer.scene.view.radius);
    //             target = new THREE.Vector3().addVectors(object.camera.position, dir);
    //             viewer.setCameraMode(Potree.CameraMode.PERSPECTIVE);
    //         }

    //         viewer.scene.view.position.copy(object.camera.position);
    //         viewer.scene.view.lookAt(target);
    //     } else if (object instanceof THREE.SpotLight) {
    //         let distance = (object.distance > 0) ? object.distance / 4 : 5 * 1000;
    //         let position = object.position;
    //         let target = new THREE.Vector3().addVectors(
    //             position,
    //             object.getWorldDirection().multiplyScalar(distance));

    //         viewer.scene.view.position.copy(object.position);
    //         viewer.scene.view.lookAt(target);
    //     } else if (object instanceof THREE.Object3D) {
    //         let box = new THREE.Box3().setFromObject(object);

    //         if (box.getSize().length() > 0) {
    //             let node = new THREE.Object3D();
    //             node.boundingBox = box;
    //             viewer.zoomTo(node, 1, 500);
    //         }
    //     }
    // });



}
