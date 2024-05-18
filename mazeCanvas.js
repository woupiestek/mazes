import { html, LitElement } from "lit";

const SCRIPTS = [
  "hyperbolic.js",
  // "hyperbolic2.js",
  "hyperbolic3.js",
  // "hyperbolic4.js",
  "hyperbolic5.js",
  "maze.js",
  "maze2.js",
  "maze3.js",
  "planar.js",
  "planar2.js",
  "spiral.js",
  "triangle_2_4_4.js",
];

export class MazeCanvas extends LitElement {
  async #onChange(e) {
    const module = await import("./" + e.target.value);
    if (module.run) {
      module.run(this.shadowRoot.querySelector("canvas"));
    }
  }

  render() {
    return html`<label for="scripts">Script:</label>
      <select id="scripts" name="scripts" @change="${(e) => this.#onChange(e)}">
        <option value="" disabled selected>Kies er één!</option>
        ${
      SCRIPTS.map(
        (script) => html`<option value="${script}">${script}</option>`,
      )
    }</select
      ><br />
      <canvas></canvas>`;
  }
}

customElements.define("maze-canvas", MazeCanvas);
