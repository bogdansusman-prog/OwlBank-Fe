import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialog,
  MatDialogModule
} from '@angular/material/dialog';

import { AsyncPipe,
  isPlatformBrowser
 } from '@angular/common';

import {
  ChangePasswordDialog
} from './change-password-dialog/change-password-dialog';

import {
  DeleteCardDialog
} from './delete-card-dialog/delete-card-dialog';

import {
  CardStatusDialog
} from './card-status-dialog/card-status-dialog';

import {
  RevealCardDialog
} from './reveal-card-dialog/reveal-card-dialog';

import {
  UserDetails,
  UserService
} from '../services/user';

import {
  CardResponse,
  CardService
} from '../services/card';

import { getErrorMessage } from '../utils/error-message';

import {
  BehaviorSubject,
  interval,
  Subscription
} from 'rxjs';


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
    FormsModule,
    AsyncPipe
  ],
  templateUrl: './account.html',
  styleUrl: './account.css'
})
export class Account implements OnInit, OnDestroy {

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
  private accountTouchStartY = 0;
  private platformId = inject(PLATFORM_ID);


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

    isCardOptionsOpen = false;


  /*    
     PROFILE
      */

  isProfileMenuOpen = false;

//Actual cards
cards = new BehaviorSubject<CardResponse[]>([]);

isCardsLoading = true;
cardsError = '';
private cardsRefreshSubscription:
  Subscription | null = null;


  /*    
     CONSTRUCTOR / INIT
      */

  constructor(
  private userService: UserService,
  private cardService: CardService,
  private router: Router,
  private dialog: MatDialog
) {}

  ngOnInit(): void {

  if (
    !isPlatformBrowser(
      this.platformId
    )
  ) {
    return;
  }

  this.loadUserDetails();

  this.loadCards();

  
}


ngOnDestroy(): void {
  this.cardsRefreshSubscription
    ?.unsubscribe();
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

loadCards(
  showLoading = true
): void {

  if (showLoading) {
    this.isCardsLoading = true;
  }

  this.cardsError = '';

  this.cardService
    .getAllCards()
    .subscribe({

      next: (
        cards: CardResponse[]
      ) => {

        this.cards.next(
          cards
        );

        if (
          this.activeCardIndex >=
          cards.length
        ) {
          this.activeCardIndex = 0;
        }

        this.isCardsLoading = false;
      },

      error: (error) => {

        console.error(
          'Cards request failed:',
          error
        );

        this.cardsError =
          'Could not load cards.';

        this.isCardsLoading = false;
      }
    });
}

//CARD HELPERS
private formatCardNumber(
  cardNumber: string
): string {
  return cardNumber
    .replace(/\s+/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim();
}


private formatExpirationDate(
  expirationDate: string
): string {
  const date =
    new Date(expirationDate);

  const month =
    String(
      date.getUTCMonth() + 1
    ).padStart(2, '0');

  const year =
    String(
      date.getUTCFullYear()
    ).slice(-2);

  return `${month}/${year}`;
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
          this.editFieldError = getErrorMessage(error, 'Could not update this field.');
        }
      });
  }



get activeCard() {

  const currentCards =
    this.cards.value;

  if (
    currentCards.length === 0
  ) {
    return null;
  }

  return currentCards[
    this.activeCardIndex
  ] ?? null;
}


toggleCardOptions(): void {
  this.isCardOptionsOpen =
    !this.isCardOptionsOpen;
}

addNewCard(): void {

  this.cardService
    .addCard()
    .subscribe({

      next: () => {

        this.isCardOptionsOpen = false;

        this.loadCards(false);
      },

      error: (error) => {

        console.error(
          'Add card failed:',
          error
        );
      }

    });
}


deleteCard(
  cardId: string
): void {

  this.cardService
    .deleteCard(cardId)
    .subscribe({

      next: () => {

        this.isCardOptionsOpen = false;

        this.loadCards(false);
      },

      error: (error) => {

        console.error(
          'Delete card failed:',
          error
        );
      }

    });
}


deleteSelectedCard(): void {

  const card =
    this.activeCard;

  if (!card) {
    return;
  }

  this.isCardOptionsOpen = false;


  const cleanNumber =
    card.cardNumber.replace(
      /\s+/g,
      ''
    );

  const lastFourDigits =
    cleanNumber.slice(-4);


  const dialogRef =
    this.dialog.open(
      DeleteCardDialog,
      {
        width: '400px',

        maxWidth:
          'calc(100vw - 24px)',

        disableClose: true,

        panelClass:
          'owlbank-delete-dialog',

        data: {
          lastFourDigits:
            lastFourDigits
        }
      }
    );


  dialogRef
    .afterClosed()
    .subscribe(
      (confirmed: boolean) => {

        if (!confirmed) {
          return;
        }

        this.deleteCard(
          card.id
        );
      }
    );
}

toggleSelectedCardStatus(): void {

  const card =
    this.activeCard;

  if (!card) {
    return;
  }

  this.isCardOptionsOpen = false;


  const lastFourDigits =
    card.cardNumber
      .replace(/\s+/g, '')
      .slice(-4);


  const action:
    'block' | 'activate' =
      card.isBlocked
        ? 'activate'
        : 'block';


  const dialogRef =
    this.dialog.open(
      CardStatusDialog,
      {
        width: '400px',

        maxWidth:
          'calc(100vw - 24px)',

        disableClose: true,

        data: {
          action,
          lastFourDigits
        }
      }
    );


  dialogRef
    .afterClosed()
    .subscribe(
      (confirmed: boolean) => {

        if (!confirmed) {
          return;
        }


        if (action === 'block') {

          this.cardService
            .blockCard(card.id)
            .subscribe({

              next: () => {

                this.updateCardBlockedState(
                  card.id,
                  true
                );
              },

              error: (error) => {

                console.error(
                  'Block card failed:',
                  error
                );
              }

            });

          return;
        }


        this.cardService
          .activateCard(card.id)
          .subscribe({

            next: () => {

              this.updateCardBlockedState(
                card.id,
                false
              );
            },

            error: (error) => {

              console.error(
                'Activate card failed:',
                error
              );
            }

          });
      }
    );
}

private updateCardBlockedState(
  cardId: string,
  isBlocked: boolean
): void {

  const updatedCards =
    this.cards.value.map(
      card => {

        if (card.id !== cardId) {
          return card;
        }

        return {
          ...card,
          isBlocked
        };
      }
    );

  this.cards.next(
    updatedCards
  );
}

closeCardOptions(): void {
  this.isCardOptionsOpen = false;
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

  this.activeAccountSection =
    section;


  /*
    MOBILE
  */

  if (
    window.innerWidth <= 650
  ) {

    if (
      section === 'details'
    ) {
      this.detailsView
        .nativeElement
        .scrollTop = 0;
    }

    return;
  }

  /*
    DESKTOP / TABLET
  */

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
    this.isSectionAnimating =
      false;
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
      this.cards.value.length - 1
    ) {
      this.selectCard(
        this.activeCardIndex + 1
      );
    }
  }

  toggleCard(): void {

    if (
      this.isCarouselAnimating
    ) {
      return;
    }


    /*
      Daca spatele este deja vizibil,
      il ascundem fara sa mai cerem parola.
    */

    if (this.isCardFlipped) {
      this.isCardFlipped = false;
      return;
    }


    /*
      Luam automat cardul pe care
      utilizatorul se afla acum.
    */

    const card =
      this.activeCard;

    if (!card) {
      return;
    }

    /*
      Cerem parola.
    */

    const dialogRef =
      this.dialog.open(
        RevealCardDialog,
        {
          width: '400px',

          maxWidth:
            'calc(100vw - 24px)',

          disableClose: true,

          panelClass:
            'owlbank-reveal-dialog'
        }
      );

    dialogRef
      .afterClosed()
      .subscribe(
        (
          password:
            string | null
        ) => {

          if (!password) {
            return;
          }

          /*
            card.id este ID-ul cardului
            activ din carousel.

            Nu cerem cardId de la user.
          */
          this.cardService
            .getCardBackDetails(
              password,
              card.id
            )
            .subscribe({

              next: (
                details
              ) => {

                /*
                  Salvam datele reale
                  doar pe cardul activ.
                */
                this.updateCardBackDetails(
                  card.id,
                  details
                );


                /*
                  Flip DOAR dupa raspuns
                  valid de la backend.
                */
                this.isCardFlipped =
                  true;
              },


              error: (error) => {

                console.error(
                  'Reveal card failed:',
                  error
                );

                /*
                  Daca parola este gresita
                  sau request-ul esueaza,
                  cardul ramane pe fata.
                */
                this.isCardFlipped =
                  false;
              }

            });
        }
      );
  }


  private updateCardBackDetails(
    cardId: string,
    details: Pick<
      CardResponse,
      | 'cvv'
      | 'expirationDate'
      | 'cardNumber'
      | 'isBlocked'
    >
  ): void {

    const updatedCards =
      this.cards.value.map(
        card => {

          if (
            card.id !== cardId
          ) {
            return card;
          }


          return {
            ...card,

            cardNumber:
              this.formatCardNumber(
                details.cardNumber
              ),

            expirationDate:
              this.formatExpirationDate(
                details.expirationDate
              ),

            cvv:
              details.cvv,

            isBlocked:
              details.isBlocked
          };
        }
      );


    this.cards.next(
      updatedCards
    );
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
  onAccountTouchStart(
  event: TouchEvent
): void {

  this.accountTouchStartY =
    event.changedTouches[0].clientY;
}

onAccountTouchEnd(
  event: TouchEvent
): void {

  const touchEndY =
    event.changedTouches[0].clientY;

  const deltaY =
    touchEndY -
    this.accountTouchStartY;

  const swipeThreshold = 50;

  if (
    deltaY < -swipeThreshold &&
    this.activeAccountSection === 'card'
  ) {

    this.goToAccountSection(
      'details'
    );

    return;
  }

  /*
    DETAILS -> CARD
  */

  if (
    deltaY > swipeThreshold &&
    this.activeAccountSection === 'details' &&
    this.detailsView
      .nativeElement
      .scrollTop <= 0
  ) {

    this.goToAccountSection(
      'card'
    );
  }
}
}
