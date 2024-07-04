<script lang="ts">
  import { DarkMode, Navbar, NavLi, NavUl, NavHamburger, NavBrand } from 'flowbite-svelte';

  let className: string;
  export { className as class };
</script>

<Navbar class={`Navbar navbar-leather ${className}`}>
  <div class='flex flex-grow justify-between'>
    <NavBrand href='./'>
      <h1 class='font-serif'>Alexandria</h1>
    </NavBrand>
  </div>
  <NavHamburger class='btn-leather' />
  <NavUl class='ul-leather'>
    <NavLi href='./about'>About</NavLi>
    <NavLi href='./create'>New Note</NavLi>
    <NavLi href='./visualize'>Visualize</NavLi>
    <NavLi href='./login'>Login</NavLi>
    <NavLi>
      <DarkMode btnClass='btn-leather p-0'/>
    </NavLi>
  </NavUl>
</Navbar>
