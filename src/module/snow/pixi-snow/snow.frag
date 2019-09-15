precision highp float;

uniform sampler2D texture;

varying vec4 v_color;
varying float v_rotation;

void main() {

    vec2 rotated = vec2(
    cos(v_rotation) * (gl_PointCoord.x - 0.5) + sin(v_rotation) * (gl_PointCoord.y - 0.5) + 0.5,
    cos(v_rotation) * (gl_PointCoord.y - 0.5) - sin(v_rotation) * (gl_PointCoord.x - 0.5) + 0.5
    );

    vec4 snowflake = texture2D(texture, rotated);

    gl_FragColor = vec4(snowflake.rgb, snowflake.a * v_color.a);
}
