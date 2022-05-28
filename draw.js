function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
    // compiled failed
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
}

function createProgram(gl, vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);

    if (gl.getProgramParameter(p, gl.LINK_STATUS)) return p;
    // link failed
    console.log(gl.getProgramInfoLog(p));
    gl.deleteProgram(p);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
}

function initGL(gl, vsrc, fsrc) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsrc);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsrc);
    if (vs == null || fs == null) return null;
    return createProgram(gl, vs, fs);
}

function getAttrib(gl, program, name) {
    const a = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(a);
    
    return a;
}

function setBuffer(gl, attrib, buffer, pos) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
    gl.vertexAttribPointer(attrib, 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 2, 0);
}

// 加载图片
const img = new Image();
img.src = 'test.jpg';
img.onload = function() {
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl');

    // 顶点着色器
    const vertexShader = `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main () {
        gl_Position = a_position;
        v_texCoord = a_texCoord;
    }`;
    // 片元着色器
    const fragmentShader = `
    // 设置浮点数精度
    //gl.vertexAttribPointer(a, 2, gl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 2, 0);
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_tex;
    void main () {
        gl_FragColor = texture2D(u_tex, v_texCoord);
    }`;

    const program = initGL(gl, vertexShader, fragmentShader);
    if (!program) {
        alert('compile or link failed');
        return;
    }
    gl.useProgram(program);

    // 获取着色器参数
    const aPos = getAttrib(gl, program, 'a_position');
    const aTexCoord = getAttrib(gl, program, 'a_texCoord');

    // 创建纹理
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // 因为图像是左上角为数据的起始点，这里我们反转一下Y方向的数据，保证它和纹理坐标系统一
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // 填充纹理数据
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    
    // 创建顶点 buffer
    const pointBuffer = gl.createBuffer();
    const texCoordBuffer = gl.createBuffer();

    // 清屏
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 画在左上角，正常方向
    setBuffer(gl, aPos, pointBuffer, [
        -0.9, 0.9,
        -0.9, 0.1,
        -0.1, 0.1,
        -0.1, 0.1,
        -0.1, 0.9,
        -0.9, 0.9,
    ]);
    setBuffer(gl, aTexCoord, texCoordBuffer,  [
        0, 1,
        0, 0,
        1, 0,
        1, 0,
        1, 1,
        0, 1,
    ]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // 画在右上角，x翻转
    setBuffer(gl, aPos, pointBuffer, [
        0.1, 0.9,
        0.1, 0.1,
        0.9, 0.1,
        0.9, 0.1,
        0.9, 0.9,
        0.1, 0.9,
    ]);
    setBuffer(gl, aTexCoord, texCoordBuffer,  [
        1, 1,
        1, 0,
        0, 0,
        0, 0,
        0, 1,
        1, 1,
    ]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // 画在左下角，y翻转
    setBuffer(gl, aPos, pointBuffer, [
        -0.9, -0.1,
        -0.9, -0.9,
        -0.1, -0.9,
        -0.1, -0.9,
        -0.1, -0.1,
        -0.9, -0.1,
    ]);
    setBuffer(gl, aTexCoord, texCoordBuffer,  [
        0, 0,
        0, 1,
        1, 1,
        1, 1,
        1, 0,
        0, 0,
    ]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // 画在右下角，x和y都翻转
    setBuffer(gl, aPos, pointBuffer, [
        0.1, -0.1,
        0.1, -0.9,
        0.9, -0.9,
        0.9, -0.9,
        0.9, -0.1,
        0.1, -0.1,
    ]);
    setBuffer(gl, aTexCoord, texCoordBuffer,  [
        1, 0,
        1, 1,
        0, 1,
        0, 1,
        0, 0,
        1, 0,
    ]);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

