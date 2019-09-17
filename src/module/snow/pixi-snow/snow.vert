precision highp float;

attribute vec4 a_position;
attribute vec3 a_rotation;
attribute vec3 a_speed;
attribute float a_size;
attribute float a_alpha;

uniform float time;
uniform mat4 projection;
uniform vec3 worldSize;
uniform float gravity;
uniform float wind;

varying float v_alpha;
varying float v_rotation;

void main() {

    v_alpha = a_alpha;
    v_rotation = a_rotation.x + time * a_rotation.y;

    vec3 pos = a_position.xyz;

    pos.x = mod(pos.x + time + wind * a_speed.x, worldSize.x * 2.0) - worldSize.x;
    pos.y = mod(pos.y - time * a_speed.y * gravity, worldSize.y * 2.0) - worldSize.y;

    pos.x += sin(time * a_speed.z) * a_rotation.z;
    pos.z += cos(time * a_speed.z) * a_rotation.z;

    gl_Position = projection * vec4(pos.xyz, a_position.w);
    gl_PointSize = a_size / gl_Position.w;
}
