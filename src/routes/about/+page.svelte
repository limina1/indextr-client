<div id="content">
  <div>1</div>
  <div>2</div>
  <div>
    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
    Lorem Ipsum has been the industry's standard dummy text ever since the
    1500s, when an unknown printer took a galley of type and scrambled it to
    make a type specimen book. It has survived not only five centuries, but also
    the leap into electronic typesetting, remaining essentially unchanged. It
    was popularised in the 1960s with the release of Letraset sheets containing
    Lorem Ipsum passages, and more recently with desktop publishing software
    like Aldus PageMaker including versions of Lorem Ipsum.
  </div>
  <div>4</div>
  <div>5</div>
  <div>6</div>
  <div>7</div>
  <div>8</div>
  <div>9</div>
</div>

<style>
  #content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, minmax(150px, auto));
    /* grid-auto-row: 200px; */
    gap: 10px;
    color: green;
    background-color: black;
  }

  #content > div {
    background-color: blue;
    padding: 10px;
    font-size: 30px;
    text-align: center;
  }
  #content div:nth-child(even) {
    background: #777;
    padding: 30px;
  }
</style>
