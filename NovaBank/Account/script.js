// კოდის ამ ნაწილში ღილაკზე დაჭერისას რომლის id - არის show-register სარეგისტრაციო ფორმა ისახება და საავტორიზაციო ფორმა იმალება
document.getElementById('show-register').addEventListener('click', function() {
    document.getElementById('login-form').style.display = 'none'
    document.getElementById('register-form').style.display = 'block'
})

// აქ კი ავტორიზაციის ფორმა ისახება და სარეგისტრაციო ფორმა იმალება
document.getElementById('show-login').addEventListener('click', function() {
    document.getElementById('register-form').style.display = 'none'
    document.getElementById('login-form').style.display = 'block'
})

// აქ localStoage-ის დახმარებით ინახება ის მონაცემი რომელიც მომხმარებელმა შემოიტანა საიტზე ხოლო თუ არაფერი არ არის შენახული გამოისახება ცარიელი ობიექტი
let users = JSON.parse(localStorage.getItem('users')) || {}
let currentUser = localStorage.getItem('currentUser')

// ეს ცვლადი ინახავს მომხმარებლის ამჟამინდელ მონაცემს ხოლო თუ localStorage-ში მონაცემი არარის შენახული მისი მნიშვნელობა არის Null
// თუ ეს ცლადი მონაცემებს უკვე ინახავს გამოიტანს dashboards
if (currentUser) {
    currentUser = JSON.parse(currentUser)
    document.getElementById('user-name').textContent = currentUser.username
    document.getElementById('balance').textContent = users[currentUser.username].balance
    updateTransactionHistory()
    showDashboard()
}

// register ფუნქციის მეშვეობით მოწმნდება მომხმარებლის მიერ შემოტანილი username, password და confirmPassword თუ ისინე სწორია შეინახება users ცვლადში და localStorage - ში
function register() {
    const username = document.getElementById('register-username').value
    const password = document.getElementById('register-password').value
    const confirmPassword = document.getElementById('register-confirm-password').value

    if (username && password && confirmPassword) {
        if (password === confirmPassword) {
            if (!users[username]) {
                users[username] = { password, balance: 0, transactions: [] }
                localStorage.setItem('users', JSON.stringify(users))
                alert('Registration successful!')
                loginAfterRegister(username, password)
            } else {
                alert('Username already exists.')
            }
        } else {
            alert('Passwords do not match.')
        }
    } else {
        alert('Please fill in all fields.')
    }
}


function loginAfterRegister(username, password) {
    if (users[username] && users[username].password === password) {
        currentUser = { username, password }
        localStorage.setItem('currentUser', JSON.stringify(currentUser))
        document.getElementById('user-name').textContent = username
        document.getElementById('balance').textContent = users[username].balance
        updateTransactionHistory()
        showDashboard()
    } else {
        alert('Invalid username or password.')
    }
}
// ეს ფუნქცია ამოწმებს მომხმარებლის მიერ შემოყვანილ სახელს და პაროლს userს ცვლადში  თუ ისინი სწორია  მომხმარებელი შევა მის account-ში და გამოსახავს dashboard-ს
function login() {
    const username = document.getElementById('login-username').value
    const password = document.getElementById('login-password').value

    if (users[username] && users[username].password === password) {
        currentUser = { username, password }
        localStorage.setItem('currentUser', JSON.stringify(currentUser))
        document.getElementById('user-name').textContent = username
        document.getElementById('balance').textContent = users[username].balance
        updateTransactionHistory()
        showDashboard()
    } else {
        alert('Invalid username or password.')
    }
}

// ფუნქცი აშორებს ამჟამინდელი მომხმარებლის მონაცემებს
function logout() {
    currentUser = null
    localStorage.removeItem('currentUser')
    showLogin()
}

// ამ ფუნქციით მომხმარებელს შეუძლია მის ანგარიშზე შეიტანოს თანხა
function deposit() {
    const amount = parseFloat(document.getElementById('amount').value)

    if (amount > 0) {
        users[currentUser.username].balance += amount
        users[currentUser.username].transactions.push({ type: 'Deposit', amount })
        localStorage.setItem('users', JSON.stringify(users))
        document.getElementById('balance').textContent = users[currentUser.username].balance
        updateTransactionHistory()
    } else {
        alert('Enter a valid amount.')
    }
}

// ამ ფუნქციით გამოიტანს
function withdraw() {
    const amount = parseFloat(document.getElementById('amount').value)

    if (amount > 0 && users[currentUser.username].balance >= amount) {
        users[currentUser.username].balance -= amount
        users[currentUser.username].transactions.push({ type: 'Withdrawal', amount })
        localStorage.setItem('users', JSON.stringify(users))
        document.getElementById('balance').textContent = users[currentUser.username].balance
        updateTransactionHistory()
    } else {
        alert('Enter a valid amount or insufficient balance.')
    }
}

// ამ ფუნქციით მომხმარებელს შეუძლია ფულის სხვა ანგარიშზე გადარიცხვა
function transfer() {
    const recipient = document.getElementById('recipient-username').value
    const amount = parseFloat(document.getElementById('transfer-amount').value)

    if (users[recipient] && amount > 0 && users[currentUser.username].balance >= amount) {
        users[currentUser.username].balance -= amount
        users[recipient].balance += amount
        users[currentUser.username].transactions.push({ type: 'Transfer', amount, recipient })
        users[recipient].transactions.push({ type: 'Received', amount, from: currentUser.username })
        localStorage.setItem('users', JSON.stringify(users))
        document.getElementById('balance').textContent = users[currentUser.username].balance
        updateTransactionHistory()
        alert('Transfer successful!')
    } else {
        alert('Invalid recipient or amount, or insufficient balance.')
    }
}

// ეს ფუუნქცია თვალს ადევნის ჩვენს ტრანზაქციას და გამოსახავს თითოეულ მათგანს
function updateTransactionHistory() {
    const history = document.getElementById('transaction-history')
    history.innerHTML = ''

    users[currentUser.username].transactions.forEach(transaction => {
        const li = document.createElement('li')
        if (transaction.type === 'Transfer') {
            li.textContent = `${transaction.type} to ${transaction.recipient}: $${transaction.amount}`
        } else if (transaction.type === 'Received') {
            li.textContent = `${transaction.type} from ${transaction.from}: $${transaction.amount}`
        } else {
            li.textContent = `${transaction.type}: $${transaction.amount}`
        }
        history.appendChild(li)
    })
}

// ამ ფუნქციით მომხმარებელს შეუძლ
 ა
function clearTransactionHistory() {
    users[currentUser.username].transactions = []
    localStorage.setItem('users', JSON.stringify(users))
    updateTransactionHistory()
    alert('Transaction history cleared!')
}

// აქ კი სარეგისტრაციო ფორმა და საავტორიზაციო ფორმა იმალება და მათ ნაცვლად dashboard გამოისახება
function showDashboard() {
    document.getElementById('register-form').style.display = 'none'
    document.getElementById('login-form').style.display = 'none'
    document.getElementById('dashboard').style.display = 'block'
}

// სარეგისტრაციო ფორმა და dashboard იმალება და მათ ნაცვლად საავტორიზაციო ფორმა გამოისახება
function showLogin() {
    document.getElementById('register-form').style.display = 'none'
    document.getElementById('login-form').style.display = 'block'
    document.getElementById('dashboard').style.display = 'none'
}

