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
  static properties = {
    script: { type: String },
  };

  render() {
    return html`<label for="scripts">Script:</label>
      <select
        id="scripts"
        name="scripts"
        @change="${async (e) => {
      this.script = e.target.value;
      await import("./" + this.script);
    }}"
      ><option value="" disabled selected>Kies er één!</option>
        ${
      SCRIPTS.map(
        (script) => html`<option value="${script}">${script}</option>`,
      )
    }
      </select>`;
  }
}

customElements.define("maze-canvas", MazeCanvas);
