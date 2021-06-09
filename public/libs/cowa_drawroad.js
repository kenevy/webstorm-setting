function COWADrawroad(pointcloud) {
    var pointcloud_projection = pointcloud.projection;
    var road_projection;
    var pointcloud = pointcloud;
    var g_scene
    function add_label(scene, position, title) {
        let annotation = new Potree.Annotation({
            title: title,
            radius: 600
        });
        pointcloud.updateMatrixWorld();
        let box = pointcloud.pcoGeometry.tightBoundingBox.clone();
        box.applyMatrix4(pointcloud.matrixWorld);

        annotation.position = position;
        scene.annotations.add(annotation);
    }
    this.add_label = function (scene, position, title) {
        add_label(scene, position, title)
    }
    this.draw_road = function (scene, data) {
        //绘制车道线

        g_scene = scene;
        road_projection = data.header.projection.proj;

        if (data.lane) {
            for (let i = 0; i < data.lane.length; i++) {
                _draw_lane_boundary(scene, data.lane[i])
            }
        }

        //绘制停车位
        if (data.parking_space) {
            for (let i = 0; i < data.parking_space.length; i++) {
                _draw_parking_space(scene, data.parking_space[i], 0xff0000)
            }
        }
        if (data.signal) {
            for (let i = 0; i < data.signal.length; i++) {
                _draw_signal(scene, data.signal[i], 0x00ff00)

            }
        }
        for (let i = 0; i < data.crossroad.length; i++) {
            _draw_crossroad(scene, data.crossroad[i], 0xff00ff);
        }
    }
    function _draw_crossroad(scene, cr, color) {
        _draw_polygon(scene, cr.boundary.point, color, 0.3);

    }
    function _draw_parking_space(scene, p, color) {
        _draw_polygon(scene, p.polygon.point, color, 0.1);
        // let min = p.polygon.point[0];
        //add_label(scene, new THREE.Vector3(min.x, min.y, 12), p.id.id);
    }
    function _draw_polygon(scene, points, color, opacity) {
        proj4.defs("pointcloud", pointcloud_projection);
        proj4.defs("WGS84", road_projection);
        let toScene = proj4("WGS84", "pointcloud");

        let pos_x = 12;
        let arr = points;

        let coordinates = [];

        let min = new THREE.Vector3(Infinity, Infinity, Infinity);
        for (let i = 0; i < arr.length; i++) {
            let [long, lat] = [arr[i].x, arr[i].y];
            let pos = toScene.forward([long, lat]);

            min.x = Math.min(min.x, pos[0]);
            min.y = Math.min(min.y, pos[1]);
            min.z = Math.min(min.z, pos_x);

            coordinates.push(...pos, pos_x);

        }
        for (let i = 0; i < coordinates.length; i += 3) {
            coordinates[i + 0] -= min.x;
            coordinates[i + 1] -= min.y;
            coordinates[i + 2] -= min.z;
        }

        var rectShape = new THREE.Shape();

        rectShape.moveTo(coordinates[0], coordinates[1]);
        for (let i = 3; i < coordinates.length; i += 3) {
            let x = coordinates[i + 0];
            let y = coordinates[i + 1];

            rectShape.lineTo(x, y);
        }

        var rectGeom = new THREE.ShapeGeometry(rectShape);
        var rectMesh = new THREE.Mesh(rectGeom, new THREE.MeshBasicMaterial({
            color: color,
            //wireframe: true,
            opacity: opacity,
            transparent: true
        }))

        rectMesh.position.copy(min);
        scene.scene.add(rectMesh);
    }
    function _draw_signal(scene, s, color) {
        if ('stopLine' in s) {
            let len = s.stopLine.length;
            let array = s.stopLine;
            for (let i = 0; i < len; i++) {
                _draw_segment(scene.scene, array[i].segment, 0x00ff00, 'stopLine');
            }
        }
        if ('waitLine' in s) {
            let len = s.waitLine.length;
            let array = s.waitLine;
            for (let i = 0; i < len; i++) {
                _draw_segment(scene.scene, array[i].segment, 0xff00ff, 'waitLine');
            }
        }
        // p = s.stopLine[0].segment[0].lineSegment.point[0]
        // add_label(scene, new THREE.Vector3(p.x, p.y, 12),s.id.id);
    }
    //加载车道线
    function _draw_lane_boundary(scene, lane) {

        // _draw_segment(scene, lane.centralCurve.segment, 0xff0000);

        // if ('curb' in lane.leftBoundary) {
        //     _draw_segment(scene.scene, lane.leftBoundary.curb.segment, 0x00ff00, 'curb', 3, 2);
        // }
        // if ('curb' in lane.rightBoundary) {
        //     _draw_segment(scene.scene, lane.rightBoundary.curb.segment, 0x00ff00, 'curb', 3, 2);
        // }
        if (lane.id.id.indexOf("+") != -1) {
            // console.log(lane.id.id)
            return
        }

        if ('curve' in lane.leftBoundary) {
            _draw_segment(scene.scene, lane.leftBoundary.curve.segment, 0xffff00, 'curve', 3);
        }
        if ('curve' in lane.rightBoundary) {
            _draw_segment(scene.scene, lane.rightBoundary.curve.segment, 0xffffff, 'curve', 3);
        }
        p = lane.centralCurve.segment[0].lineSegment.point[0];
        //添加限速标志
        // if ('speedLimit' in lane)
        //     add_label(scene, new THREE.Vector3(p.x, p.y, 10), "speedLimit:" + lane.speedLimit);
        // if ('direction' in lane)
        //     add_label(scene, new THREE.Vector3(p.x, p.y, 15), lane.direction);
        // if ('turn' in lane)
        //     add_label(scene, new THREE.Vector3(p.x, p.y, 20), lane.turn);
        // if ('type' in lane)
        //     add_label(scene, new THREE.Vector3(p.x, p.y, 10), lane.type);
        // add_label(scene, new THREE.Vector3(p.x, p.y, 10), lane.id.id);
    }

    function _draw_segment(scene, segment, color, name = 'cowa_line', linewidth = 1, Line_type = 1) {

        for (let i = 0; i < segment.length; i++) {
            let path = [];
            let len = segment[i].lineSegment.point.length;
            let array = segment[i].lineSegment.point;

            for (let i = 0; i < len; i++) {
                // p = new THREE.Vector3(
                //     array[i].x,
                //     array[i].y,
                //     array[i].z)
                // path.push(p);
                path.push(array[i].x);
                path.push(array[i].y);
                if (isNaN(array[i].z))
                    path.push(11)
                else
                    path.push(array[i].z);
            }
            drawline(scene, path, color, linewidth, Line_type, name)
        }

    }


    function drawline(scene, path, color, linewidth, Line_type, name) {
        proj4.defs("pointcloud", pointcloud_projection);
        proj4.defs("WGS84", road_projection);
        let toScene = proj4("WGS84", "pointcloud");

        let coordinates = [];
        let min = new THREE.Vector3(Infinity, Infinity, Infinity);
        for (let i = 0; i < path.length; i += 3) {
            // let [long, lat, x] = path[i];//geometry.coordinates[i];
            let long = path[i + 0];
            let lat = path[i + 1];
            let z = path[i + 2];
            let pos = toScene.forward([long, lat, z]);

            min.x = Math.min(min.x, pos[0]);
            min.y = Math.min(min.y, pos[1]);
            min.z = Math.min(min.z, pos[2]);

            coordinates.push(...pos);

        }
        for (let i = 0; i < coordinates.length; i += 3) {
            coordinates[i + 0] -= min.x;
            coordinates[i + 1] -= min.y;
            coordinates[i + 2] -= min.z;
        }
        let buffer = new Float32Array(coordinates);
        let geometry = new THREE.BufferGeometry();
        let material = new THREE.LineBasicMaterial({
            color: color,
            linewidth: linewidth,
        });
        geometry.addAttribute('position', new THREE.BufferAttribute(buffer, 3));
        //  geometry.computeBoundingSphere();
        let line

        if (Line_type == 1)
            line = new THREE.LineSegments(geometry, material);
        else
            line = new THREE.Line(geometry, material);
        line.name = name;
        line.position.copy(min);
        scene.add(line);
    }

}