export const didShaderCompile = (gl, shader, name) => {
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`ERROR: Was not able to compile the  ${name} shader`, gl.getShaderInfoLog(shader))
        return false;
    }
    return true;
}

export const didProgramLink = (gl, program) => {
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("ERROR:  linking program!", gl.getProgramInfoLog(program));
        return false;
    }
    return true;
}

export const isProgramValid = (gl, program) => {
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        return false;
    }
    return true;
}