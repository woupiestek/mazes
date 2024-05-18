import { css, html, LitElement } from "lit";

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
  static styles = [
    css`
      canvas {
        margin: auto;
      }
      .container {
        display: flex;
      }
      .menu {
        background-color: #dddddd;
        height: 700px;
      }
    `,
  ];
  async #onChange(e) {
    const module = await import("./" + e.target.value);
    if (module.run) {
      module.run(this.shadowRoot.querySelector("canvas"));
    }
  }

  render() {
    return html`<div class="container">
      <div class="menu">
        <label for="scripts">Script:</label><br />
        <select
          id="scripts"
          name="scripts"
          @change="${(e) => this.#onChange(e)}"
        >
          <option value="" disabled selected>Kies er één!</option>
          ${
      SCRIPTS.map(
        (script) => html`<option value="${script}">${script}</option>`,
      )
    }
        </select>
      </div>
      <canvas tabindex="0"></canvas>
    </div>`;
  }
}

customElements.define("maze-canvas", MazeCanvas);
