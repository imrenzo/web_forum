function MyButton() {
    return (
        <button>
            I'm a button
        </button>
    );
}

export function MyApp() {
    return (
        <div>
            <h1>Welcome to my app</h1>
            <MyButton />
        </div>
    );
}

export default MyApp;