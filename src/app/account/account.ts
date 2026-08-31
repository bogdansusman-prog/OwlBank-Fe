import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-account',
  imports: [
    RouterLink,
    MatIconModule
  ],
  templateUrl: './account.html',
  styleUrl: './account.css'
})


export class Account {

  private holdTimer: ReturnType<typeof setTimeout> | null = null;

  private touchHoldActive = false;

  private activePointerId: number | null = null;

  isCardFlipped = false;


  toggleCard(): void {

    this.isCardFlipped =
      !this.isCardFlipped;

  }


  onCardPointerDown(
    event: PointerEvent
  ): void {

    const wrapper =
      event.currentTarget as HTMLElement;


    /*
      MOUSE

      Pe PC:
      click = turbulence.
    */

    if (event.pointerType === 'mouse') {

      this.triggerTurbulence(wrapper);

      return;
    }


    /*
      TOUCH / PEN

      Nu pornim tilt-ul imediat.

      Asteptam sa vedem daca
      utilizatorul tine degetul.
    */

    this.activePointerId =
      event.pointerId;

    this.touchHoldActive =
      false;


    wrapper.setPointerCapture(
      event.pointerId
    );


    this.holdTimer =
      setTimeout(() => {

        this.touchHoldActive =
          true;

        this.applyCardTilt(
          event,
          wrapper
        );

      }, 250);
  }


  onCardPointerMove(
    event: PointerEvent
  ): void {

    const wrapper =
      event.currentTarget as HTMLElement;


    /*
      PC

      Tilt-ul functioneaza
      normal cu hover-ul.
    */

    if (event.pointerType === 'mouse') {

      this.applyCardTilt(
        event,
        wrapper
      );

      return;
    }


    /*
      TELEFON / TABLETA

      Tilt-ul functioneaza
      numai dupa HOLD.
    */

    if (
      this.touchHoldActive &&
      event.pointerId ===
        this.activePointerId
    ) {

      this.applyCardTilt(
        event,
        wrapper
      );
    }
  }


  onCardPointerUp(
    event: PointerEvent
  ): void {

    const wrapper =
      event.currentTarget as HTMLElement;


    /*
      Mouse-ul nu are nevoie
      de acest comportament.
    */

    if (event.pointerType === 'mouse') {

      return;
    }


    /*
      Anulam timer-ul HOLD.
    */

    if (this.holdTimer !== null) {

      clearTimeout(
        this.holdTimer
      );

      this.holdTimer =
        null;
    }


    /*
      TAP rapid

      => turbulence
    */

    if (!this.touchHoldActive) {

      this.triggerTurbulence(
        wrapper
      );
    }


    /*
      HOLD terminat

      => cardul revine la pozitia
      initiala.
    */

    this.resetCardTilt(
      wrapper
    );


    this.touchHoldActive =
      false;

    this.activePointerId =
      null;
  }


  onCardPointerLeave(
    event: PointerEvent
  ): void {

    const wrapper =
      event.currentTarget as HTMLElement;


    /*
      Doar mouse-ul are hover.
    */

    if (
      event.pointerType ===
      'mouse'
    ) {

      this.resetCardTilt(
        wrapper
      );
    }
  }


  onCardPointerCancel(
    event: PointerEvent
  ): void {

    const wrapper =
      event.currentTarget as HTMLElement;


    if (this.holdTimer !== null) {

      clearTimeout(
        this.holdTimer
      );

      this.holdTimer =
        null;
    }


    this.touchHoldActive =
      false;

    this.activePointerId =
      null;


    this.resetCardTilt(
      wrapper
    );
  }


  private applyCardTilt(
    event: PointerEvent,
    wrapper: HTMLElement
  ): void {

    const rect =
      wrapper.getBoundingClientRect();


    /*
      Pozitia cursorului/degetului
      in interiorul cardului.
    */

    const mouseX =
      event.clientX -
      rect.left;

    const mouseY =
      event.clientY -
      rect.top;


    const centerX =
      rect.width / 2;

    const centerY =
      rect.height / 2;


    /*
      Coordonate normalizate.

      stanga = -1
      centru = 0
      dreapta = 1

      sus = -1
      centru = 0
      jos = 1
    */

    const rawX =
      (mouseX - centerX) /
      centerX;

    const rawY =
      (mouseY - centerY) /
      centerY;


    /*
      Distanta fata de centru.
    */

    const distance =
      Math.sqrt(
        rawX * rawX +
        rawY * rawY
      );


    /*
      Zona mica din centru
      unde cardul ramane drept.
    */

    const deadZone = 0.05;


    let rotateX = 0;
    let rotateY = 0;

    let lightAngle = 135;

    let lightingOpacity = 0;


    if (
      distance >
      deadZone
    ) {

      /*
        Directia cursorului
        fata de centru.
      */

      const directionX =
        rawX / distance;

      const directionY =
        rawY / distance;


      /*
        Intensitatea efectului.

        0 = centru
        1 = margine
      */

      let strength =
        (
          Math.min(
            distance,
            1
          ) -
          deadZone
        ) /
        (
          1 -
          deadZone
        );


      strength =
        Math.max(
          0,
          Math.min(
            1,
            strength
          )
        );


      /*
        Reactie mai rapida
        dupa iesirea din centru.
      */

      strength =
        Math.pow(
          strength,
          0.72
        );


      /*
        Cat de mult se inclina
        cardul.
      */

      const maxTilt = 11;


      /*
        Cursor SUS
        => partea de sus coboara

        Cursor JOS
        => partea de jos coboara

        Cursor STANGA
        => partea stanga coboara

        Cursor DREAPTA
        => partea dreapta coboara
      */

      rotateX =
        -directionY *
        maxTilt *
        strength;

      rotateY =
        directionX *
        maxTilt *
        strength;


      /*
        =================================
        LUMINA
        =================================

        Vrem lumina OPUSA cursorului.

        Cursor dreapta
        => lumina stanga

        Cursor stanga
        => lumina dreapta

        Cursor sus
        => lumina jos

        Cursor jos
        => lumina sus
      */


      const oppositeX =
        -directionX;

      const oppositeY =
        -directionY;


      /*
        Transformam directia opusa
        intr-un unghi CSS.

        + 90 ne ajuta sa potrivim
        orientarea gradientului cu
        suprafata cardului.
      */

      lightAngle =
        Math.atan2(
          oppositeY,
          oppositeX
        ) *
        180 /
        Math.PI +
        90;


      /*
        Cu cat ne apropiem de margine,
        cu atat reflexia devine mai vizibila.
      */

      lightingOpacity =
        0.20 +
        strength * 0.65;
    }


    /*
      Activam starea de tilt.
    */

    wrapper.classList.add(
      'is-tilting'
    );


    /*
      Tilt.
    */

    wrapper.style.setProperty(
      '--tilt-x',
      `${rotateX}deg`
    );

    wrapper.style.setProperty(
      '--tilt-y',
      `${rotateY}deg`
    );


    /*
      Lumina.
    */

    wrapper.style.setProperty(
      '--light-angle',
      `${lightAngle}deg`
    );

    wrapper.style.setProperty(
      '--lighting-opacity',
      `${lightingOpacity}`
    );
  }


  private resetCardTilt(
    wrapper: HTMLElement
  ): void {

    wrapper.classList.remove(
      'is-tilting'
    );


    wrapper.style.setProperty(
      '--tilt-x',
      '0deg'
    );

    wrapper.style.setProperty(
      '--tilt-y',
      '0deg'
    );


    /*
      Stingem reflexia cand
      cursorul/degetul pleaca.
    */

    wrapper.style.setProperty(
      '--lighting-opacity',
      '0'
    );
  }


  private triggerTurbulence(
    wrapper: HTMLElement
  ): void {

    /*
      Scoatem clasa pentru ca
      animatia sa poata fi pornita
      din nou imediat.
    */

    wrapper.classList.remove(
      'is-turbulent'
    );


    /*
      Forceaza browserul sa recalculeze
      layout-ul si permite retrigger-ul.
    */

    void wrapper.offsetWidth;


    wrapper.classList.add(
      'is-turbulent'
    );


    setTimeout(() => {

      wrapper.classList.remove(
        'is-turbulent'
      );

    }, 300);
  }
}