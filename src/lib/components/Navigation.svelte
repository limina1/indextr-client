<script lang="ts">
</script>

<div class="NavBar">
  <a href="./about"> About</a>
  <a href="./create"> New Note</a>
  <a href="./visualize"> Visualize</a>
  <a href="./login" class="login"> Login</a>
</div>

<style>
  .login {
    float: right;
  }
  .NavBar {
    overflow: hidden;
    background-color: #333;
  }

  .NavBar a {
    float: left;
    display: block;
    color: #f2f2f2;
    text-align: center;
    padding: 14px 16px;
    text-decoration: none;
  }

  .NavBar a:hover {
    background-color: #ddd;
    color: black;
  }

  .NavBar a.active {
    background-color: #4caf50;
    color: white;
  }
</style>
