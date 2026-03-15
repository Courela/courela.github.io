// import Pusher from 'pusher-js'
// import { produce } from '@monorepo/context/index.js'
// import IS_DEVELOPMENT from '@monorepo/env/IS_DEVELOPMENT.js'
// import IS_PRODUCTION from '@monorepo/env/IS_PRODUCTION.js'
// import ENVIRONMENT from '@monorepo/env/ENVIRONMENT.js'
// import getMeal from '@waiterio/api-client/getMeal.js'
// import Meal from '@waiterio/model/Meal.js'
// import Event from '@waiterio/model/Event.js'
// import fetchAccount from '../fetch/fetchAccount.js'
// import fetchCategory from '../fetch/fetchCategory.js'
// import fetchInvite from '../fetch/fetchInvite.js'
// import fetchItem from '../fetch/fetchItem.js'
// import fetchMap from '../fetch/fetchMap.js'
// import fetchMenu from '../fetch/fetchMenu.js'
// import fetchPayment from '../fetch/fetchPayment.js'
// import fetchPrinter from '../fetch/fetchPrinter.js'
// import fetchRestaurant from '../fetch/fetchRestaurant.js'
// import fetchRole from '../fetch/fetchRole.js'
// import fetchSubscription from '../fetch/fetchSubscription.js'
// import fetchTerminal from '../fetch/fetchTerminal.js'
// import fetchUser from '../fetch/fetchUser.js'
// import {
//   handleMealAddedEvent,
//   handleMealUpdatedEvent,
// } from './NotificationsHandler.js'
// import printNewTicket from '../print/printNewTicket.js'
// import isLoggedInSession from '../session/isLoggedInSession.js'
// import getCurrentRestaurantId from '../session/getCurrentRestaurantId.js'

// import { plantAccount, burnAccount } from '../forage/AccountsForage.js'
// import { plantInvite, burnInvite } from '../forage/InvitesForage.js'
// import { plantMap } from '../forage/MapsForage.js'
// import { pickMeal, plantMeal, burnMeal } from '../forage/MealsForage.js'
// import {
//   plantCategory,
//   plantItem,
//   plantMenu,
//   burnCategory,
//   burnItem,
// } from '../forage/MenusForage.js'
// import { plantPayment, burnPayment } from '../forage/PaymentsForage.js'
// import { plantPrinter, burnPrinter } from '../forage/PrintersForage.js'
// import { plantRestaurant } from '../forage/RestaurantsForage.js'
// import { plantRole, burnRole } from '../forage/RolesForage.js'
// import {
//   plantSubscription,
//   burnSubscription,
// } from '../forage/SubscriptionsForage.js'
// import { plantTerminal, burnTerminal } from '../forage/TerminalsForage.js'
// import { pickUser, plantUser, burnUser } from '../forage/UsersForage.js'

const Event = {
  MEAL_ADDED_EVENT: 'MEAL_ADDED_EVENT',
  MEAL_UPDATED_EVENT: 'MEAL_UPDATED_EVENT',
  
  ITEM_ADDED_EVENT: 'ITEM_ADDED_EVENT',
  ITEM_REMOVED_EVENT: 'ITEM_REMOVED_EVENT',
  
  /*
  MENU_ADDED_EVENT: 'MENU_ADDED_EVENT',
  MENU_UPDATED_EVENT: 'MENU_UPDATED_EVENT',
  
  CATEGORY_ADDED_EVENT: 'CATEGORY_ADDED_EVENT',
  CATEGORY_UPDATED_EVENT: 'CATEGORY_UPDATED_EVENT',
  
  MEAL_REMOVED_EVENT: 'MEAL_REMOVED_EVENT',
  
  MENU_REMOVED_EVENT: 'MENU_REMOVED_EVENT',

  ITEM_UPDATED_EVENT: 'ITEM_UPDATED_EVENT',
  
  ACCOUNT_ADDED_EVENT: 'ACCOUNT_ADDED_EVENT',
  ACCOUNT_REMOVED_EVENT: 'ACCOUNT_REMOVED_EVENT',
  ACCOUNT_UPDATED_EVENT: 'ACCOUNT_UPDATED_EVENT',
  CATEGORY_REMOVED_EVENT: 'CATEGORY_REMOVED_EVENT',
  CHARGE_ADDED_EVENT: 'CHARGE_ADDED_EVENT',
  CHARGE_REMOVED_EVENT: 'CHARGE_REMOVED_EVENT',
  CHARGE_UPDATED_EVENT: 'CHARGE_UPDATED_EVENT',
  DEVICE_ADDED_EVENT: 'DEVICE_ADDED_EVENT',
  DEVICE_REMOVED_EVENT: 'DEVICE_REMOVED_EVENT',
  DEVICE_UPDATED_EVENT: 'DEVICE_UPDATED_EVENT',
  CURRENT_MEALS_UPDATED_EVENT: 'CURRENT_MEALS_UPDATED_EVENT',
  INVITE_ADDED_EVENT: 'INVITE_ADDED_EVENT',
  INVITE_REMOVED_EVENT: 'INVITE_REMOVED_EVENT',
  INVITE_UPDATED_EVENT: 'INVITE_UPDATED_EVENT',
  ITEMSTAMP_ADDED_EVENT: 'ITEMSTAMP_ADDED_EVENT',
  ITEMSTAMP_REMOVED_EVENT: 'ITEMSTAMP_REMOVED_EVENT',
  ITEMSTAMP_UPDATED_EVENT: 'ITEMSTAMP_UPDATED_EVENT',
  MAP_ADDED_EVENT: 'MAP_ADDED_EVENT',
  MAP_REMOVED_EVENT: 'MAP_REMOVED_EVENT',
  MAP_UPDATED_EVENT: 'MAP_UPDATED_EVENT',
  PAYMENT_ADDED_EVENT: 'PAYMENT_ADDED_EVENT',
  PAYMENT_REMOVED_EVENT: 'PAYMENT_REMOVED_EVENT',
  PAYMENT_UPDATED_EVENT: 'PAYMENT_UPDATED_EVENT',
  PRINTER_ADDED_EVENT: 'PRINTER_ADDED_EVENT',
  PRINTER_REMOVED_EVENT: 'PRINTER_REMOVED_EVENT',
  PRINTER_UPDATED_EVENT: 'PRINTER_UPDATED_EVENT',
  RESTAURANT_ADDED_EVENT: 'RESTAURANT_ADDED_EVENT',
  RESTAURANT_REMOVED_EVENT: 'RESTAURANT_REMOVED_EVENT',
  RESTAURANT_UPDATED_EVENT: 'RESTAURANT_UPDATED_EVENT',
  ROLE_ADDED_EVENT: 'ROLE_ADDED_EVENT',
  ROLE_REMOVED_EVENT: 'ROLE_REMOVED_EVENT',
  ROLE_UPDATED_EVENT: 'ROLE_UPDATED_EVENT',
  SUBSCRIPTION_ADDED_EVENT: 'SUBSCRIPTION_ADDED_EVENT',
  SUBSCRIPTION_REMOVED_EVENT: 'SUBSCRIPTION_REMOVED_EVENT',
  SUBSCRIPTION_UPDATED_EVENT: 'SUBSCRIPTION_UPDATED_EVENT',
  TERMINAL_ADDED_EVENT: 'TERMINAL_ADDED_EVENT',
  TERMINAL_REMOVED_EVENT: 'TERMINAL_REMOVED_EVENT',
  TERMINAL_UPDATED_EVENT: 'TERMINAL_UPDATED_EVENT',
  TEST_EVENT: 'TEST_EVENT',
  USER_ADDED_EVENT: 'USER_ADDED_EVENT',
  USER_REMOVED_EVENT: 'USER_REMOVED_EVENT',
  USER_UPDATED_EVENT: 'USER_UPDATED_EVENT',
  */
};

const pusher = new Pusher('8af67bd4bfc5f2d7874b', { cluster: 'mt1', forceTLS: window.forceTLS });

// Pusher.log = function (message) {
//
//   if (window.console && window.console.log) {
//     window.console.log(message)
//   }
//
// }

let channel = null;
let channelName = null;
let previous_previous = null;

function subscribe() {
    const restaurantId = getCurrentRestaurantId();

    if (restaurantId) {
      if (channel && channelName) {
        pusher.unsubscribe(channelName);
        channel = null;
        channelName = null;
      }

      pusher.connection.bind('state_change', pusherStates => {
        pusherStates.previous_previous = previous_previous;

        // console.log(pusherStates)

        produce(draft => {
            draft.connection.pusherStates = pusherStates  
        });  
        
        previous_previous = pusherStates.previous
      });  

      channelName = 'restaurant_' + restaurantId;

      //   if (!IS_PRODUCTION) {
      //     channelName += '_' + ENVIRONMENT        
      //   }
      
      channel = pusher.subscribe(channelName);
      
      channel.bind(Event.MEAL_ADDED_EVENT, this.handleMealAddedEvent, this);
      channel.bind(Event.MEAL_UPDATED_EVENT, this.handleMealUpdatedEvent, this);
      
      channel.bind(Event.ITEM_ADDED_EVENT, this.handleItemAddedEvent, this);
      channel.bind(Event.ITEM_REMOVED_EVENT, this.handleItemDeletedEvent, this);
      
      /*
      channel.bind(Event.ITEM_UPDATED_EVENT, this.handleItemUpdatedEvent, this);
      channel.bind(Event.MENU_ADDED_EVENT, this.handleMenuAddedEvent, this);
      channel.bind(Event.MENU_UPDATED_EVENT, this.handleMenuUpdatedEvent, this);
      
      channel.bind(Event.CATEGORY_ADDED_EVENT, this.handleCategoryAddedEvent, this);
      channel.bind(Event.CATEGORY_UPDATED_EVENT, this.handleCategoryUpdatedEvent, this);
      
      channel.bind(Event.MEAL_REMOVED_EVENT, this.handleMealDeletedEvent, this)

      channel.bind(
        Event.ACCOUNT_ADDED_EVENT,  
        this.handleAccountAddedEvent,
        this,
      )  
      channel.bind(
        Event.ACCOUNT_REMOVED_EVENT,  
        this.handleAccountDeletedEvent,
        this,
      )  
      channel.bind(
        Event.ACCOUNT_UPDATED_EVENT,  
        this.handleAccountUpdatedEvent,
        this,
      )  
      channel.bind(
        Event.CATEGORY_REMOVED_EVENT,  
        this.handleCategoryDeletedEvent,
        this,
      )  

      channel.bind(Event.INVITE_ADDED_EVENT, this.handleInviteAddedEvent, this)
      channel.bind(
        Event.INVITE_REMOVED_EVENT,  
        this.handleInviteDeletedEvent,
        this,
      )  
      channel.bind(
        Event.INVITE_UPDATED_EVENT,  
        this.handleInviteAddedEvent,
        this,
      )
      
      channel.bind(Event.MAP_UPDATED_EVENT, this.handleMapUpdatedEvent, this)

      channel.bind(
        Event.PAYMENT_ADDED_EVENT,
        this.handlePaymentAddedEvent,
        this,
      )
      channel.bind(
        Event.PAYMENT_REMOVED_EVENT,
        this.handlePaymentDeletedEvent,
        this,
      )
      channel.bind(
        Event.PAYMENT_UPDATED_EVENT,
        this.handlePaymentUpdatedEvent,
        this,
      )

      channel.bind(
        Event.PRINTER_ADDED_EVENT,
        this.handlePrinterAddedEvent,
        this,
      )
      channel.bind(
        Event.PRINTER_REMOVED_EVENT,
        this.handlePrinterDeletedEvent,
        this,
      )
      channel.bind(
        Event.PRINTER_UPDATED_EVENT,
        this.handlePrinterUpdatedEvent,
        this,
      )

      channel.bind(
        Event.RESTAURANT_UPDATED_EVENT,
        this.handleRestaurantUpdatedEvent,
        this,
      )

      channel.bind(Event.ROLE_ADDED_EVENT, this.handleRoleAddedEvent, this)
      channel.bind(Event.ROLE_REMOVED_EVENT, this.handleRoleDeletedEvent, this)
      channel.bind(Event.ROLE_UPDATED_EVENT, this.handleRoleUpdatedEvent, this)

      channel.bind(
        Event.SUBSCRIPTION_ADDED_EVENT,
        this.handleSubscriptionAddedEvent,
        this,
      )
      channel.bind(
        Event.SUBSCRIPTION_REMOVED_EVENT,
        this.handleSubscriptionDeletedEvent,
        this,
      )
      channel.bind(
        Event.SUBSCRIPTION_UPDATED_EVENT,
        this.handleSubscriptionUpdatedEvent,
        this,
      )

      channel.bind(
        Event.TERMINAL_ADDED_EVENT,
        this.handleTerminalAddedEvent,
        this,
      )
      channel.bind(
        Event.TERMINAL_REMOVED_EVENT,
        this.handleTerminalDeletedEvent,
        this,
      )
      channel.bind(
        Event.TERMINAL_UPDATED_EVENT,
        this.handleTerminalUpdatedEvent,
        this,
      )

      channel.bind(Event.USER_ADDED_EVENT, this.handleUserAddedEvent, this)
      channel.bind(Event.USER_REMOVED_EVENT, this.handleUserDeletedEvent, this)
      channel.bind(Event.USER_UPDATED_EVENT, this.handleUserUpdatedEvent, this)
        */
    }
}

const produceImmer = producer => state => {
  const draft = deepClone(state)
  producer(draft)

  return draft
};

const produceScope = produce => (first, second) => {
  let producer
  let scope

  if (first) {
    if (typeof first === 'function') {
      producer = first
    } else if (first.constructor === Array) {
      scope = first
    }
  }

  if (second) {
    if (typeof second === 'function') {
      producer = second
    } else if (second.constructor === Array) {
      scope = second
    }
  }

  if (producer && scope) {
    return produce(draft => producer(path(draft, scope)))
  } else if (scope) {
    return producer =>
      produce(draft => {
        if (producer) {
          producer(path(draft, scope))
        } else {
          path(draft, scope.slice(0, -1))[scope.slice(-1)[0]] = {}
        }
      })
  } else {
    return produce(producer)
  }
};

const produce = produceScope(producer =>
  window.state = produceImmer(producer));

function handleMealAddedEvent(mealEvent) {
  if (
    mealEvent.restaurantId &&
    mealEvent.restaurantId === getCurrentRestaurantId()
  ) {
    if (mealEvent.meal) {
      console.log("Meal added! " + JSON.stringify(mealEvent));
      addMeal(mealEvent.meal);
    } else {
      getMeal(mealEvent.mealId)
        .then(meal => {
          if (meal) {
            mealEvent.meal = meal;
            this.handleMealAddedOrUpdatedEvent(mealEvent);
          }
        })
    }
  }
}

function handleMealUpdatedEvent(mealEvent) {
  if (
    mealEvent.restaurantId &&
    mealEvent.restaurantId === getCurrentRestaurantId()
  ) {
    if (mealEvent.meal) {
      console.log("Meal '" + mealEvent.mealId + "' updated! ");
      updateMeal(mealEvent.mealId, mealEvent.meal);
    } else {
      console.log("Meal '" + mealEvent.mealId + "' updated without meal data! Fetching meal... ");
      getMeal(mealEvent.mealId).then(meal => {
        if (meal) {
          mealEvent.meal = meal;
          this.handleMealAddedOrUpdatedEvent(mealEvent);
        }
      })
    }
  }
}

function handleItemAddedEvent(itemAddedEvent) {
  if (
    itemAddedEvent.restaurantId &&
    itemAddedEvent.restaurantId === getCurrentRestaurantId()
  ) {
    if (itemAddedEvent.item) {
      console.log("Item '" + itemAddedEvent.itemId + "' added!");
      addOrUpdateMenuItem(itemAddedEvent.categoryId, itemAddedEvent.item);

      recalculateDashboard();
    } else {
      getItem(itemAddedEvent.menuId, itemAddedEvent.categoryId, itemAddedEvent.itemId).then(item => {
        if (item) {
          itemAddedEvent.item = item
          this.handleItemAddedEvent(itemAddedEvent)
        }
      });
    }
  }
}

function handleItemDeletedEvent(itemDeletedEvent) {
  if (
      itemDeletedEvent.restaurantId &&
      itemDeletedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      console.log("Item '" + itemDeletedEvent.itemId + "' removed!");
      deleteMenuItem(itemDeletedEvent.categoryId, itemDeletedEvent.itemId);

      recalculateDashboard();
    }
  }

  /********************* TODO *****************************/
  function handleItemUpdatedEvent(itemUpdatedEvent) {
      if (
        itemUpdatedEvent.restaurantId &&
        itemUpdatedEvent.restaurantId === getCurrentRestaurantId()
      ) {
        if (itemUpdatedEvent.item) {
          console.log("Item '" + itemUpdatedEvent.itemId + "' updated!");
          addOrUpdateMenuItem(itemUpdatedEvent.categoryId, itemUpdatedEvent.item);
          
          recalculateDashboard();
        } else {
          getItem(itemUpdatedEvent.menuId, itemUpdatedEvent.categoryId, itemUpdatedEvent.itemId).then(item => {
            if (item) {
              itemUpdatedEvent.item = item
              this.handleItemUpdatedEvent(itemUpdatedEvent)
            }
          });
        }
      }
  }
        
function handleMenuAddedEvent(menuAddedEvent) {
  if (
    menuAddedEvent.restaurantId &&
    menuAddedEvent.restaurantId === getCurrentRestaurantId()
  ) {
    onRefreshMenu();
  }
}

function handleMenuUpdatedEvent(menuUpdatedEvent) {
  if (
    menuUpdatedEvent.restaurantId &&
    menuUpdatedEvent.restaurantId === getCurrentRestaurantId()
  ) {
    onRefreshMenu();
  }
}

function handleCategoryAddedEvent(categoryAddedEvent) {
    if (
      categoryAddedEvent.restaurantId &&
      categoryAddedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      onRefreshMenu();
  }
}

function handleCategoryUpdatedEvent(categoryUpdatedEvent) {
    if (
      categoryUpdatedEvent.restaurantId &&
      categoryUpdatedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      onRefreshMenu();
      // if (categoryUpdatedEvent.category) {
        //   plantCategory(
          //     categoryUpdatedEvent.menuId,
          //     categoryUpdatedEvent.category,
          //   )
      // } else {
      //   fetchCategory(
      //     categoryUpdatedEvent.restaurantId,
      //     categoryUpdatedEvent.menuId,
      //     categoryUpdatedEvent.categoryId,
      //   )
      // }
    }
}
        
  function handleMealDeletedEvent(mealDeletedEvent) {
      if (
        mealDeletedEvent.restaurantId &&
        mealDeletedEvent.restaurantId === getCurrentRestaurantId()
      ) {
        burnMeal(mealDeletedEvent.mealId)
      }
  }

function handleAccountAddedEvent(accountAddedEvent) {
    if (
      accountAddedEvent.restaurantId &&
      accountAddedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      if (accountAddedEvent.account) {
        plantAccount(accountAddedEvent.account)
      } else {
        fetchAccount(
          accountAddedEvent.restaurantId,
          accountAddedEvent.accountId,
        )
      }
    }
}

function handleAccountDeletedEvent(accountDeletedEvent) {
    if (
      accountDeletedEvent.restaurantId &&
      accountDeletedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      burnAccount(accountDeletedEvent.accountId)
    }
}

function handleAccountUpdatedEvent(accountUpdatedEvent) {
    if (
      accountUpdatedEvent.restaurantId &&
      accountUpdatedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      if (accountUpdatedEvent.account) {
        plantAccount(accountUpdatedEvent.account)
      } else {
        fetchAccount(
          accountUpdatedEvent.restaurantId,
          accountUpdatedEvent.printerId,
        )
      }
    }
}

function handleCategoryAddedEvent(categoryAddedEvent) {
    if (
      categoryAddedEvent.restaurantId &&
      categoryAddedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      if (categoryAddedEvent.category) {
        plantCategory(categoryAddedEvent.menuId, categoryAddedEvent.category)
      } else {
        fetchCategory(
          categoryAddedEvent.restaurantId,
          categoryAddedEvent.menuId,
          categoryAddedEvent.categoryId,
        )
      }
    }
  }

 function handleCategoryDeletedEvent(categoryDeletedEvent) {
    if (
      categoryDeletedEvent.restaurantId &&
      categoryDeletedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      burnCategory(categoryDeletedEvent.menuId, categoryDeletedEvent.categoryId)
    }
  }

 function handleInviteAddedEvent(inviteAddedEvent) {
    if (
      inviteAddedEvent.restaurantId &&
      inviteAddedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      if (inviteAddedEvent.invite) {
        plantInvite(inviteAddedEvent.invite)
      } else {
        fetchInvite(inviteAddedEvent.restaurantId, inviteAddedEvent.inviteId)
      }
    }
  }

  function handleInviteDeletedEvent(inviteDeletedEvent) {
    if (
      inviteDeletedEvent.restaurantId &&
      inviteDeletedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      burnInvite(inviteDeletedEvent.inviteId)
    }
  }

  function handleInviteUpdatedEvent(inviteUpdatedEvent) {
    if (
      inviteUpdatedEvent.restaurantId &&
      inviteUpdatedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      if (inviteUpdatedEvent.invite) {
        plantInvite(inviteUpdatedEvent.invite)
      } else {
        fetchInvite(
          inviteUpdatedEvent.restaurantId,
          inviteUpdatedEvent.inviteId,
        )
      }
    }
  }

  function handleMapUpdatedEvent(mapUpdatedEvent) {
    if (
      mapUpdatedEvent.restaurantId &&
      mapUpdatedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      if (mapUpdatedEvent.map) {
        plantMap(mapUpdatedEvent.map)
      } else {
        fetchMap()
      }
    }
  }

  function handlePaymentAddedEvent(paymentAddedEvent) {
    if (
      paymentAddedEvent.restaurantId &&
      paymentAddedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      if (paymentAddedEvent.payment) {
        plantPayment(paymentAddedEvent.payment)
      } else {
        fetchPayment(
          paymentAddedEvent.restaurantId,
          paymentAddedEvent.paymentId,
        )
      }
    }
  }

  function handlePaymentDeletedEvent(paymentDeletedEvent) {
    if (
      paymentDeletedEvent.restaurantId &&
      paymentDeletedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      burnPayment(paymentDeletedEvent.paymentId)
    }
  }

  function handlePaymentUpdatedEvent(paymentUpdatedEvent) {
    if (
      paymentUpdatedEvent.restaurantId &&
      paymentUpdatedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      if (paymentUpdatedEvent.payment) {
        plantPayment(paymentUpdatedEvent.payment)
      } else {
        fetchPayment(
          paymentUpdatedEvent.restaurantId,
          paymentUpdatedEvent.paymentId,
        )
      }
    }
  }

  function handlePrinterAddedEvent(printerAddedEvent) {
    if (
      printerAddedEvent.restaurantId &&
      printerAddedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      if (printerAddedEvent.printer) {
        plantPrinter(printerAddedEvent.printer)
      } else {
        fetchPrinter(
          printerAddedEvent.restaurantId,
          printerAddedEvent.printerId,
        )
      }
    }
  }

  function handlePrinterDeletedEvent(printerDeletedEvent) {
    if (
      printerDeletedEvent.restaurantId &&
      printerDeletedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      burnPrinter(printerDeletedEvent.printerId)
    }
  }

  function handlePrinterUpdatedEvent(printerUpdatedEvent) {
    if (
      printerUpdatedEvent.restaurantId &&
      printerUpdatedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      if (printerUpdatedEvent.printer) {
        plantPrinter(printerUpdatedEvent.printer)
      } else {
        fetchPrinter(
          printerUpdatedEvent.restaurantId,
          printerUpdatedEvent.printerId,
        )
      }
    }
  }

  function handleRestaurantUpdatedEvent(restaurantUpdatedEvent) {
    if (
      restaurantUpdatedEvent.restaurantId &&
      restaurantUpdatedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      if (restaurantUpdatedEvent.restaurant) {
        plantRestaurant(restaurantUpdatedEvent.restaurant)
      } else {
        fetchRestaurant()
      }
    }
  }

  function handleRoleAddedEvent(roleAddedEvent) {
    if (
      roleAddedEvent.restaurantId &&
      roleAddedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      if (roleAddedEvent.role) {
        Promise.all([
          plantRole(roleAddedEvent.role),
          pickUser(roleAddedEvent.role.userId),
        ]).then(([_, user]) => {
          if (!user) {
            fetchUser(roleAddedEvent.role.userId)
          }
        })
      } else {
        fetchRole(roleAddedEvent.roleId)
      }
    }
  }

  function handleRoleDeletedEvent(roleDeletedEvent) {
    if (
      roleDeletedEvent.restaurantId &&
      roleDeletedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      burnRole(roleDeletedEvent.roleId).then(() => {
        isLoggedInSession()
      })
    }
  }

  function handleRoleUpdatedEvent(roleUpdatedEvent) {
    if (
      roleUpdatedEvent.restaurantId &&
      roleUpdatedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      if (roleUpdatedEvent.role) {
        plantRole(roleUpdatedEvent.role)
      } else {
        fetchRole(roleUpdatedEvent.roleId)
      }
    }
  }

  function handleSubscriptionAddedEvent(subscriptionAddedEvent) {
    if (
      subscriptionAddedEvent.restaurantId &&
      subscriptionAddedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      if (subscriptionAddedEvent.subscription) {
        console.log("Subscription added! " + JSON.stringify(subscriptionAddedEvent));
        // plantSubscription(subscriptionAddedEvent.subscription)
      } else {
        fetchSubscription(
          subscriptionAddedEvent.restaurantId,
          subscriptionAddedEvent.subscriptionId,
        )
      }
    }
  }

  function handleSubscriptionDeletedEvent(subscriptionDeletedEvent) {
    if (
      subscriptionDeletedEvent.restaurantId &&
      subscriptionDeletedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      burnSubscription(subscriptionDeletedEvent.subscriptionId)
    }
  }

  function handleSubscriptionUpdatedEvent(subscriptionUpdatedEvent) {
    if (
      subscriptionUpdatedEvent.restaurantId &&
      subscriptionUpdatedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      if (subscriptionUpdatedEvent.subscription) {
        plantSubscription(subscriptionUpdatedEvent.subscription)
      } else {
        fetchSubscription(
          subscriptionUpdatedEvent.restaurantId,
          subscriptionUpdatedEvent.subscriptionId,
        )
      }
    }
  }

  function handleTerminalAddedEvent(terminalAddedEvent) {
    if (
      terminalAddedEvent.restaurantId &&
      terminalAddedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      if (terminalAddedEvent.terminal) {
        plantTerminal(terminalAddedEvent.terminal)
      } else {
        fetchTerminal(
          terminalAddedEvent.restaurantId,
          terminalAddedEvent.terminalId,
        )
      }
    }
  }

  function handleTerminalDeletedEvent(terminalDeletedEvent) {
    if (
      terminalDeletedEvent.restaurantId &&
      terminalDeletedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      burnTerminal(terminalDeletedEvent.terminalId)
    }
  }

  function handleTerminalUpdatedEvent(terminalUpdatedEvent) {
    if (
      terminalUpdatedEvent.restaurantId &&
      terminalUpdatedEvent.restaurantId === getCurrentRestaurantId()
    ) {
      if (terminalUpdatedEvent.terminal) {
        plantTerminal(terminalUpdatedEvent.terminal)
      } else {
        fetchTerminal(
          terminalUpdatedEvent.restaurantId,
          terminalUpdatedEvent.terminalId,
        )
      }
    }
  }

  function handleUserAddedEvent(userAddedEvent) {
    if (userAddedEvent.user) {
      plantUser(userAddedEvent.user)
    } else {
      fetchUser(userAddedEvent.userId)
    }
  }

  function handleUserDeletedEvent(userDeletedEvent) {
    burnUser(userDeletedEvent.userId)
  }

  function handleUserUpdatedEvent(userUpdatedEvent) {
    if (userUpdatedEvent.user) {
      plantUser(userUpdatedEvent.user)
    } else {
      fetchUser(userUpdatedEvent.userId)
    }
  }
