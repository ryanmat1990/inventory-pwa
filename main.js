
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");

  const loadScript = (src, callback) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
  };

  loadScript("https://cdnjs.cloudflare.com/ajax/libs/localforage/1.10.0/localforage.min.js", () => {
    root.innerHTML = `
      <div style="font-family: sans-serif; padding: 1rem;">
        <h1>Parts Inventory</h1>
        <input id="name" placeholder="Part name" style="padding: 0.5rem; margin: 0.5rem 0;" />
        <input id="qty" type="number" placeholder="Quantity" value="1" style="padding: 0.5rem;" />
        <input type="file" id="photo" accept="image/*" />
        <button onclick="addPart()" style="display:block; margin:1rem 0;">Add Part</button>
        <div id="list"></div>
      </div>
    `;

    renderList();

    function renderList() {
      localforage.getItem("parts").then(parts => {
        const listDiv = document.getElementById("list");
        if (!parts || parts.length === 0) {
          listDiv.innerHTML = "<p>No parts added.</p>";
          return;
        }
        listDiv.innerHTML = parts.map(p => \`
          <div style="border:1px solid #ccc; padding:1rem; margin-bottom:1rem;">
            <strong>\${p.name}</strong> (Qty: \${p.quantity})<br/>
            <img src="\${p.photo}" style="max-width:100px; max-height:100px; display:block;" />
            <img src="\${p.barcode}" /><br/>
            <button onclick="deletePart('\${p.id}')">Delete</button>
          </div>
        \`).join('');
      });
    }

    window.addPart = () => {
      const name = document.getElementById("name").value;
      const quantity = parseInt(document.getElementById("qty").value);
      const file = document.getElementById("photo").files[0];
      if (!name || !file) {
        alert("Name and photo required.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const id = "PRT-" + Math.random().toString(36).substring(2, 6).toUpperCase();
        const canvas = document.createElement("canvas");
        JsBarcode(canvas, id, { format: "CODE128", width: 2, height: 40 });
        const barcode = canvas.toDataURL("image/png");
        const part = { id, name, quantity, photo: reader.result, barcode };
        localforage.getItem("parts").then(parts => {
          parts = parts || [];
          parts.push(part);
          localforage.setItem("parts", parts).then(renderList);
        });
      };
      reader.readAsDataURL(file);
    };

    window.deletePart = (id) => {
      localforage.getItem("parts").then(parts => {
        parts = parts.filter(p => p.id !== id);
        localforage.setItem("parts", parts).then(renderList);
      });
    };
  });
});
