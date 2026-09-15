import {
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import {
  ChangePasswordDialog
} from './change-password-dialog/change-password-dialog';

import {
  UserDetails,
  UserService
} from '../services/user';

type EditableUserField =
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'phoneNumber';

@Component({
  selector: 'app-account',
  imports: [
    RouterLink,
    MatIconModule,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './account.html',
  styleUrl: './account.css'
})
export class Account implements OnInit {

  /*    
     ACCOUNT SECTIONS
      */

  @ViewChild('cardView')
  cardView!: ElementRef<HTMLElement>;

  @ViewChild('detailsView')
  detailsView!: ElementRef<HTMLElement>;

  activeAccountSection:
    'card' | 'details' = 'card';

  private isSectionAnimating = false;


  /*    
     USER DETAILS
      */

  userDetails:
    UserDetails | null = null;

  isUserDetailsLoading = true;
  userDetailsError = '';

  editingField:
    EditableUserField | null = null;

  editValue = '';
  isSavingField = false;
  editFieldError = '';


  /*    
     CARD STATE
      */

  isCardFlipped = false;
  isCarouselAnimating = false;
  activeCardIndex = 0;

  private holdTimer:
    ReturnType<typeof setTimeout> | null = null;

  private touchHoldActive = false;

  private activePointerId:
    number | null = null;


  /*    
     PROFILE
      */

  isProfileMenuOpen = false;


  /*    
     TEMPORARY MOCK CARDS
      */

  cards = [
    {
      number: '4532 8912 7645 4821',
      holder: 'OWL BANK USER',
      expiry: '08/29',
      cvv: '527'
    },
    {
      number: '5198 2241 6732 1147',
      holder: 'OWL BANK USER',
      expiry: '11/29',
      cvv: '314'
    },
    {
      number: '4716 9034 2251 8890',
      holder: 'OWL BANK USER',
      expiry: '03/30',
      cvv: '682'
    },
    {
      number: '5521 3309 8821 5412',
      holder: 'OWL BANK USER',
      expiry: '07/30',
      cvv: '193'
    },
    {
      number: '4917 6432 1109 3748',
      holder: 'OWL BANK USER',
      expiry: '12/30',
      cvv: '845'
    }
  ];


  /*    
     CONSTRUCTOR / INIT
      */

  constructor(
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
  }


  /*    
     USER DETAILS
      */

  loadUserDetails(): void {
    this.isUserDetailsLoading = true;
    this.userDetailsError = '';

    this.userService
      .getUserDetails()
      .subscribe({
        next: (
          details: UserDetails
        ) => {
          this.userDetails = details;
          this.isUserDetailsLoading = false;
        },

        error: (error) => {
          console.error(
            'User details request failed:',
            error
          );

          this.userDetailsError =
            'Could not load account details.';

          this.isUserDetailsLoading = false;
        }
      });
  }

  startEditing(
    field: EditableUserField
  ): void {
    if (
      !this.userDetails ||
      this.isSavingField
    ) {
      return;
    }

    this.editingField = field;
    this.editValue =
      this.userDetails[field] ?? '';

    this.editFieldError = '';
  }

  cancelEditing(): void {
    if (this.isSavingField) {
      return;
    }

    this.resetEditingState();
  }

  saveEditing(
    field: EditableUserField
  ): void {
    if (
      !this.userDetails ||
      this.editingField !== field ||
      this.isSavingField
    ) {
      return;
    }

    const value =
      this.editValue.trim();

    if (!value) {
      this.editFieldError =
        'This field cannot be empty.';
      return;
    }

    if (
      field === 'email' &&
      !this.isValidEmail(value)
    ) {
      this.editFieldError =
        'Please enter a valid email address.';
      return;
    }

    if (
      field === 'phoneNumber' &&
      !this.isValidPhoneNumber(value)
    ) {
      this.editFieldError =
        'Please enter a valid phone number.';
      return;
    }

    if (
      value ===
      this.userDetails[field]
    ) {
      this.resetEditingState();
      return;
    }

    this.isSavingField = true;
    this.editFieldError = '';

    this.userService
      .updateUserDetails({
        [field]: value
      })
      .subscribe({
        next: () => {
          if (!this.userDetails) {
            this.isSavingField = false;
            return;
          }

          this.userDetails = {
            ...this.userDetails,
            [field]: value
          };

          this.resetEditingState();
        },

        error: (error) => {
          console.error(
            'User details update failed:',
            error
          );

          this.isSavingField = false;

          if (
            typeof error.error ===
              'string' &&
            error.error.trim()
          ) {
            this.editFieldError =
              error.error;
            return;
          }

          this.editFieldError =
            'Could not update this field.';
        }
      });
  }

  private resetEditingState(): void {
    this.editingField = null;
    this.editValue = '';
    this.isSavingField = false;
    this.editFieldError = '';
  }

  private isValidEmail(
    email: string
  ): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(email);
  }

  private isValidPhoneNumber(
    phoneNumber: string
  ): boolean {
    return /^\+?[0-9]{9,15}$/
      .test(phoneNumber);
  }


  /*    
     ACCOUNT SECTION NAVIGATION
      */

  goToAccountSection(
    section: 'card' | 'details'
  ): void {
    if (this.isSectionAnimating) {
      return;
    }

    this.activeAccountSection = section;
    this.isSectionAnimating = true;

    const target =
      section === 'card'
        ? this.cardView
        : this.detailsView;

    target.nativeElement
      .scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

    setTimeout(() => {
      this.isSectionAnimating = false;
    }, 700);
  }

  onAccountWheel(
    event: WheelEvent
  ): void {
    if (this.isSectionAnimating) {
      event.preventDefault();
      return;
    }

    if (
      event.deltaY > 5 &&
      this.activeAccountSection ===
        'card'
    ) {
      event.preventDefault();

      this.goToAccountSection(
        'details'
      );

      return;
    }

    if (
      event.deltaY < -5 &&
      this.activeAccountSection ===
        'details'
    ) {
      event.preventDefault();

      this.goToAccountSection(
        'card'
      );
    }
  }

  onAccountScroll(
    event: Event
  ): void {
    /*
      La click / wheel controlat, starea este
      deja setata de goToAccountSection().
      Evitam schimbari intermediare in timpul
      animatiei de scroll.
    */
    if (this.isSectionAnimating) {
      return;
    }

    const container =
      event.currentTarget;

    if (
      !(container instanceof HTMLElement) ||
      !this.cardView ||
      !this.detailsView
    ) {
      return;
    }

    const containerRect =
      container.getBoundingClientRect();

    const cardRect =
      this.cardView
        .nativeElement
        .getBoundingClientRect();

    const detailsRect =
      this.detailsView
        .nativeElement
        .getBoundingClientRect();

    const getVisibleHeight = (
      rect: DOMRect
    ): number => {
      const top =
        Math.max(
          rect.top,
          containerRect.top
        );

      const bottom =
        Math.min(
          rect.bottom,
          containerRect.bottom
        );

      return Math.max(
        0,
        bottom - top
      );
    };

    const cardVisible =
      getVisibleHeight(cardRect);

    const detailsVisible =
      getVisibleHeight(detailsRect);

    /*
      Zona mica neutra pentru a evita
      licarirea cand ambele sectiuni sunt
      aproape la fel de vizibile.
    */
    if (
      Math.abs(
        cardVisible -
        detailsVisible
      ) < 20
    ) {
      return;
    }

    this.activeAccountSection =
      cardVisible > detailsVisible
        ? 'card'
        : 'details';
  }


  /*    
     CARD HELPERS
      */

  getMaskedNumber(
    number: string
  ): string {
    return (
      `.... .... .... ` +
      `${number.slice(-4)}`
    );
  }

  selectCard(
    index: number
  ): void {
    if (
      this.isCarouselAnimating ||
      index === this.activeCardIndex
    ) {
      return;
    }

    if (
      Math.abs(
        index -
        this.activeCardIndex
      ) !== 1
    ) {
      return;
    }

    this.isCarouselAnimating = true;
    this.isCardFlipped = false;
    this.activeCardIndex = index;

    setTimeout(() => {
      this.isCarouselAnimating = false;
    }, 560);
  }

  previous(): void {
    if (
      this.activeCardIndex > 0
    ) {
      this.selectCard(
        this.activeCardIndex - 1
      );
    }
  }

  next(): void {
    if (
      this.activeCardIndex <
      this.cards.length - 1
    ) {
      this.selectCard(
        this.activeCardIndex + 1
      );
    }
  }

  toggleCard(): void {
    if (this.isCarouselAnimating) {
      return;
    }

    this.isCardFlipped =
      !this.isCardFlipped;
  }


  /*    
     CARD POINTER / TOUCH
      */

  onCardPointerDown(
    event: PointerEvent,
    index: number
  ): void {
    if (
      index !== this.activeCardIndex ||
      this.isCarouselAnimating
    ) {
      return;
    }

    const wrapper =
      event.currentTarget;

    if (
      !(wrapper instanceof HTMLElement)
    ) {
      return;
    }

    if (
      event.pointerType === 'mouse'
    ) {
      this.triggerTurbulence(
        wrapper
      );
      return;
    }

    this.activePointerId =
      event.pointerId;

    this.touchHoldActive = false;

    wrapper.setPointerCapture(
      event.pointerId
    );

    this.holdTimer =
      setTimeout(() => {
        this.touchHoldActive = true;

        this.applyCardTilt(
          event,
          wrapper
        );
      }, 250);
  }

  onCardPointerMove(
    event: PointerEvent,
    index: number
  ): void {
    if (
      index !== this.activeCardIndex ||
      this.isCarouselAnimating
    ) {
      return;
    }

    const wrapper =
      event.currentTarget;

    if (
      !(wrapper instanceof HTMLElement)
    ) {
      return;
    }

    if (
      event.pointerType === 'mouse'
    ) {
      this.applyCardTilt(
        event,
        wrapper
      );
      return;
    }

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
    event: PointerEvent,
    index: number
  ): void {
    if (
      index !== this.activeCardIndex
    ) {
      return;
    }

    const wrapper =
      event.currentTarget;

    if (
      !(wrapper instanceof HTMLElement)
    ) {
      return;
    }

    if (
      event.pointerType === 'mouse'
    ) {
      return;
    }

    this.clearHoldTimer();

    if (!this.touchHoldActive) {
      this.triggerTurbulence(
        wrapper
      );
    }

    this.resetCardTilt(
      wrapper
    );

    this.touchHoldActive = false;
    this.activePointerId = null;
  }

  onCardPointerLeave(
    event: PointerEvent
  ): void {
    const wrapper =
      event.currentTarget;

    if (
      !(wrapper instanceof HTMLElement)
    ) {
      return;
    }

    if (
      event.pointerType === 'mouse'
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
      event.currentTarget;

    if (
      !(wrapper instanceof HTMLElement)
    ) {
      return;
    }

    this.clearHoldTimer();

    this.touchHoldActive = false;
    this.activePointerId = null;

    this.resetCardTilt(
      wrapper
    );
  }

  private clearHoldTimer(): void {
    if (!this.holdTimer) {
      return;
    }

    clearTimeout(
      this.holdTimer
    );

    this.holdTimer = null;
  }


  /*    
     CARD PHYSICS / LIGHT
      */

  private applyCardTilt(
    event: PointerEvent,
    wrapper: HTMLElement
  ): void {
    const rect =
      wrapper.getBoundingClientRect();

    const mouseX =
      event.clientX - rect.left;

    const mouseY =
      event.clientY - rect.top;

    const centerX =
      rect.width / 2;

    const centerY =
      rect.height / 2;

    const rawX =
      (mouseX - centerX) /
      centerX;

    const rawY =
      (mouseY - centerY) /
      centerY;

    const distance =
      Math.sqrt(
        rawX * rawX +
        rawY * rawY
      );

    const deadZone = 0.05;

    let rotateX = 0;
    let rotateY = 0;

    let lightX = 50;
    let lightY = 50;

    let lightingOpacity = 0;

    if (distance > deadZone) {
      const directionX =
        rawX / distance;

      const directionY =
        rawY / distance;

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

      strength =
        Math.pow(
          strength,
          0.72
        );

      const maxTilt = 11;

      rotateX =
        -directionY *
        maxTilt *
        strength;

      rotateY =
        directionX *
        maxTilt *
        strength;

      const normalizedTiltX =
        rotateX / maxTilt;

      const normalizedTiltY =
        rotateY / maxTilt;

      /*
        Lumina este calculata din inclinarea
        cardului, nu direct din cursor.
      */
      lightX =
        50 -
        normalizedTiltY * 45;

      lightY =
        50 +
        normalizedTiltX * 45;

      lightingOpacity =
        0.18 +
        strength * 0.68;
    }

    wrapper.classList.add(
      'is-tilting'
    );

    wrapper.style.setProperty(
      '--tilt-x',
      `${rotateX}deg`
    );

    wrapper.style.setProperty(
      '--tilt-y',
      `${rotateY}deg`
    );

    wrapper.style.setProperty(
      '--light-x',
      `${lightX}%`
    );

    wrapper.style.setProperty(
      '--light-y',
      `${lightY}%`
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

    wrapper.style.setProperty(
      '--light-x',
      '50%'
    );

    wrapper.style.setProperty(
      '--light-y',
      '50%'
    );

    wrapper.style.setProperty(
      '--lighting-opacity',
      '0'
    );
  }

  private triggerTurbulence(
    wrapper: HTMLElement
  ): void {
    wrapper.classList.remove(
      'is-turbulent'
    );

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


  /*    
     PROFILE / ACCOUNT HELPERS
      */

  toggleProfileMenu(): void {
    this.isProfileMenuOpen =
      !this.isProfileMenuOpen;
  }

  signOut(): void {
    localStorage.removeItem(
      'token'
    );

    this.isProfileMenuOpen = false;

    this.router.navigate([
      '/login'
    ]);
  }

  formatDateOfBirth(
    dateOfBirth?: string
  ): string {
    if (!dateOfBirth) {
      return '—';
    }

    const datePart =
      dateOfBirth.substring(
        0,
        10
      );

    const [
      year,
      month,
      day
    ] = datePart.split('-');

    if (
      !year ||
      !month ||
      !day
    ) {
      return dateOfBirth;
    }

    return `${day}/${month}/${year}`;
  }

  openChangePasswordDialog(): void {
    if (!this.userDetails) {
      return;
    }

    this.dialog.open(
      ChangePasswordDialog,
      {
        width: '440px',

        maxWidth:
          'calc(100vw - 24px)',

        data: {
          email:
            this.userDetails.email
        },

        panelClass:
          'owlbank-password-dialog'
      }
    );
  }
}
