<script></script>
<div class="form-container boxy-elevated">
  <h2 class="form-title">Upload Packages</h2>
  <p class="form-note">
    Catatan: pastikan packages sudah berisi <code>mol.yaml</code> atau <code>mol.md</code> dan disertai <code>read.md</code>.
  </p>

  <!-- Input File Boxy -->
  <div class="boxy-input-group boxy-elevated">
    <label class="boxy-label" for="packageFile">Pilih Package</label>
    <div class="boxy-file-drop" id="packageDrop">
      <span>Drag & Drop or Click to Add Package</span>
      <input type="file" id="packageFile" class="boxy-file-input" multiple />
    </div>
  </div>

  <!-- Submit Button -->
  <button class="btn btn-primary" id="uploadBtn">Upload Packages</button>
</div>
