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
  "maze4.js",
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
        display: flex;
        flex-direction: column;
        background-color: #dddddd;
        height: 700px;
      }
    `,
  ];

  async #onChange(e) {
    this.__module = await import("./" + e.target.value);
    this.#onClick();
  }
  #onClick() {
    if (this.__module?.run) {
      this.__module.run(this.shadowRoot.querySelector("canvas"));
    }
  }
  render() {
    return html`<div class="container">
      <div class="menu">
        <label for="scripts">Script:</label>
        <select
          id="scripts"
          name="scripts"
          @change="${(e) => this.#onChange(e)}"
        >
          <option value="" disabled selected>Kies er één!</option>
          ${SCRIPTS.map(
            (script) => html`<option value="${script}">${script}</option>`
          )}</select
        ><button @click=${() => this.#onClick()}>run</button>
      </div>
      <canvas tabindex="0"></canvas>
    </div>`;
  }
}

customElements.define("maze-canvas", MazeCanvas);
