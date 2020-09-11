import React, {PureComponent, useState, useMemo, memo, useEffect, useCallback, useRef, Component} from 'react';
import logo from './logo.svg';
import{
    createAdd,
    createRemove,
    createSet,
    createToggle
} from "./actions";
import './App.css';

let idSeq = Date.now();

function  bindActionCreators(actionCreators, dispatch) {
    const ret = {};
    for (let key in actionCreators) {
        ret[key] = function (...args) {
            const actionCreator = actionCreators[key];
            const action = actionCreator(...args);
            dispatch(action);
        }
    }
    return ret;
}

const Control = memo(function Control(props) {
    const { addTodo } = props;
    const inputRef = useRef();
    const onSubmit = (e) => {
        e.preventDefault();
        const newText = inputRef.current.value.trim();
        if (newText.length === 0) return;
        addTodo({
            id: ++idSeq,
            text: newText,
            complete: false,
        });
        inputRef.current.value = '';
    };
    return <div className="control">
        <h1>Todos</h1>
        <form onSubmit={onSubmit}>
            <input ref={inputRef}
                   type="text"
                   className="new-todo"
                   placeholder="What needs to be done"
            />
        </form>
    </div>;
});

const TodoItem = memo(function TodoItem(props) {
    const {
        todo: {
            id,
            text,
            complete
        },
        toggleTodo, removeTodo
    } = props;
    const onChange = () => {toggleTodo(id)};
    const onRemove = () => {removeTodo(id)};
    return (
        <li className="todo-item">
            <input type="checkbox"
                   onChange={onChange}
                   checked={complete}
            />
            <label className={complete ? 'complete' : ''}>{ text }</label>
            <button onClick={onRemove}>&#xd7;</button>
        </li>
    );
});

const Todos = memo(function Todos(props) {
    const { todos, toggleTodo, removeTodo } = props;
    return (
        <ul>
            {
                todos.map(todo => {
                    return (<TodoItem
                    key={todo.id} todo={todo} toggleTodo={toggleTodo} removeTodo={removeTodo} />)
                })
            }
        </ul>
    );
});

const LS_KEY = '_$-todos_';

function TodoList() {
    const [todos, setTodos] = useState([]);
    const [incrementCount, setIncrementCount] = useState(0);
    // const addTodo = useCallback((todo) => {
    //     setTodos(todos => [...todos, todo]);
    // }, []);
    // const removeTodo = useCallback((id) => {
    //     setTodos(todos => todos.filter(todo => {
    //         return todo.id != id;
    //     }));
    // }, []);
    // const toggleTodo = useCallback((id) => {
    //     setTodos(todos => todos.map(todo => {
    //         return todo.id === id
    //         ? {
    //             ...todo,
    //                 complete: !todo.complete,
    //             }
    //         : todo;
    //     }))
    // }, []);
    const dispatch = useCallback((action) => {
        const { type, payload } = action;
        switch(type) {
            case 'set':
                setTodos(payload);
                setIncrementCount(c => c + 1);
                break;
            case 'add':
                setTodos(todos => [...todos, payload]);
                setIncrementCount(c => c + 1);
                break;
            case 'remove':
                setTodos(todos => todos.filter(todo => {
                    return todo.id != payload;
                }));
                break;
            case 'toggle':
                setTodos(todos => todos.map(todo => {
                    return todo.id === payload
                        ? {
                            ...todo,
                            complete: !todo.complete,
                        }
                        : todo;
                }))
                break;
            default:
        }
    }, []);

    useEffect(() => {
        const todos = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
        dispatch(createSet(todos));
    }, []);
    useEffect(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(todos));
    }, [todos])

    return (
        <div className="todo-list">
            <Control {
                ...bindActionCreators({
                    addTodo: createAdd
                }, dispatch)
                     } />
            <Todos {...bindActionCreators({
                toggleTodo: createToggle,
                removeTodo: createRemove
            }, dispatch)} todos={todos}/>
        </div>
    );
}

export default TodoList;